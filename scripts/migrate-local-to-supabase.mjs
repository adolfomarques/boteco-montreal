#!/usr/bin/env node

/**
 * Script para migrar dados locais → Supabase
 *
 * Uso:
 *   1. Configure .env.local com as credenciais do Supabase
 *   2. Execute: node scripts/migrate-local-to-supabase.mjs
 *
 * O script lê os arquivos .local-data/*.json e insere no Supabase
 * via API REST usando a chave service_role (service key).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(process.cwd(), '.local-data');

function loadJSON(file) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); }
  catch { return null; }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // NOT the anon key!

  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    console.log(`
❌ Supabase não configurado.
   1. Crie um projeto em https://supabase.com
   2. Defina no .env.local:
      NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
   3. Defina SUPABASE_SERVICE_KEY no .env.local (Service Role Key do dashboard)
   4. Execute o seed SQL em scripts/seed-supabase.sql no SQL Editor do Supabase
`);
    process.exit(1);
  }

  console.log(`📦 Migrando dados locais para ${supabaseUrl}\n`);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`,
    'Prefer': 'return=minimal',
  };

  async function post(table, rows) {
    if (!rows || rows.length === 0) return;
    const url = new URL(`/rest/v1/${table}`, supabaseUrl).href;
    for (const row of rows) {
      await new Promise((resolve, reject) => {
        const data = JSON.stringify(row);
        const u = new URL(url);
        const req = https.request({
          hostname: u.hostname,
          port: 443,
          path: u.pathname,
          method: 'POST',
          headers: { ...headers, 'Content-Length': Buffer.byteLength(data) },
        }, (res) => {
          if (res.statusCode < 300) resolve();
          else {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => reject(new Error(`${res.statusCode}: ${body}`)));
          }
        });
        req.on('error', reject);
        req.write(data);
        req.end();
      });
      console.log(`  ✓ ${table}: ${row.name || row.title_pt || row.day_label || 'ok'}`);
    }
  }

  // 1. Migrar eventos
  const events = loadJSON('events.json');
  if (events && events.length > 0) {
    console.log('\n📅 Migrando eventos...');
    await post('events', events);
  }

  // 2. Migrar reservas
  const reservations = loadJSON('reservations.json');
  if (reservations && reservations.length > 0) {
    console.log('\n📋 Migrando reservas...');
    await post('reservations', reservations);
  }

  // 3. Migrar configurações
  const settings = loadJSON('settings.json');
  if (settings) {
    console.log('\n⚙️  Migrando configurações...');
    await post('site_settings', [{
      key: 'restaurant_info',
      value: settings,
    }]);
  }

  console.log('\n✅ Migração concluída!');
  console.log('   Agora remova os dados locais: rm -rf .local-data');
  console.log('   E reinicie o servidor: npm run dev');
}

main().catch(console.error);
