# Plano: Upload de Imagens e Videos pelo Painel Admin

## Objetivo

Substituir o input de URL por um sistema de upload direto de imagens e videos no painel administrativo, usando **Supabase Storage** (gratuito).

---

## 1. Por que Supabase Storage?

| Criterio | Supabase Storage | Cloudinary | Local (public/) |
|---|---|---|---|
| **Custo** | Gratuito (1GB storage, 2GB bandwidth/mes) | Gratuito (25GB) | Gratuito |
| **Setup** | Ja configurado (mesmo projeto Supabase) | Nova conta + API keys | Nenhum |
| **Vercel** | Funciona (URLs publicas) | Funciona | NAO funciona (filesystem read-only) |
| **Auth** | Integrado com Supabase Auth (ja existe) | Separado | N/A |
| **Complexidade** | Baixa (SDK ja instalado) | Media | Alta (nao funciona em prod) |

**Decisao: Supabase Storage.** O projeto ja usa Supabase para auth e banco de dados. O Storage vem incluido no plano gratuito e o SDK `@supabase/supabase-js` ja esta instalado. Nenhuma dependencia nova necessaria.

---

## 2. Arquitetura Proposta

### Fluxo de Upload

```
Admin clica em "Upload"
  → Seleciona arquivo do computador
  → Comprime/redimensiona (client-side, Canvas API)
  → Upload direto para Supabase Storage via browser
  → Recebe URL publica (ex: https://duilupnttahqeyluhsvg.supabase.co/storage/v1/object/public/boteco-media/menu/123.jpg)
  → Preenche automaticamente o campo image_url no formulario
  → Salva no banco (mesmo fluxo atual: localStorage → API → Supabase)
```

### Por que upload client-side (browser) e nao via API route?

- O admin ja esta autenticado via Supabase Auth (`signInWithPassword`)
- O browser mantem a sessao ativa (token JWT)
- O SDK do Supabase envia o token automaticamente
- RLS policies no Storage controlam permissao (so `authenticated` pode fazer upload)
- Sem necessidade de API route intermediaria
- Sem limite de tamanho de request do Vercel (10MB)

### Estrutura de Pastas no Bucket

```
boteco-media/
├── menu/          # Imagens de itens do menu
├── events/        # Imagens de eventos
├── gallery/       # Imagens/videos da galeria
└── landing/       # Imagens do "NOSSA COZINHA"
```

Nome dos arquivos: `{timestamp}-{random}.{ext}` (ex: `1712345678-a3f2b1.jpg`)

---

## 3. Setup no Supabase Dashboard (uma vez, manual)

### 3.1 Criar o Bucket

1. Acessar https://supabase.com/dashboard/project/duilupnttahqeyluhsvg/storage/buckets
2. Clicar em **"New bucket"**
3. Nome: `boteco-media`
4. **Public bucket: ON** (para URLs publicas funcionarem)
5. Criar

### 3.2 Configurar RLS Policies

No SQL Editor do Supabase, executar:

```sql
-- Permitir upload apenas para usuarios autenticados (admins)
create policy "Admin upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'boteco-media');

-- Permitir leitura publica (qualquer visitante do site)
create policy "Public read" on storage.objects
for select to public
using (bucket_id = 'boteco-media');

-- Permitir admin atualizar seus arquivos
create policy "Admin update" on storage.objects
for update to authenticated
using (bucket_id = 'boteco-media');

-- Permitir admin deletar arquivos
create policy "Admin delete" on storage.objects
for delete to authenticated
using (bucket_id = 'boteco-media');
```

> **Importante:** O role `authenticated` so inclui usuarios logados via Supabase Auth. Visitantes do site publico ficam com role `anon` e so podem ler.

---

## 4. Alteracoes no Codigo

### 4.1 Novo arquivo: `lib/upload.ts` (utilitario de upload)

Responsabilidades:
- Receber `File` do input
- Comprimir/redimensionar imagens (Canvas API, max 1920px, qualidade 80%)
- Gerar nome unico para o arquivo
- Upload para Supabase Storage
- Retornar URL publica

Funcoes exportadas:
```ts
uploadImage(file: File, folder: string): Promise<string>  // retorna URL publica
uploadVideo(file: File, folder: string): Promise<string>  // retorna URL publica
deleteMedia(url: string): Promise<void>                   // remove do storage
```

### 4.2 Novo componente: `components/admin/ImageUploadField.tsx`

Componente reutilizavel que substitui o input de URL atual:

```
[Preview da imagem]  [Botao "Escolher arquivo"]  [Ou cole URL]  [X remover]
```

Props:
- `value: string | null` — URL atual da imagem
- `onChange: (url: string | null) => void` — callback quando muda
- `folder: string` — pasta no bucket (menu, events, gallery, landing)
- `accept: string` — tipos aceitos (default: `image/*`)

Comportamento:
- Se `value` existe: mostra preview + botao remover
- Se nao existe: mostra area de drop/click para selecionar
- Apos upload: preenche `value` com URL do Supabase
- Campo de URL manual permanece como opcao alternativa

### 4.3 Substituir inputs de URL nos 4 forms admin

| Arquivo | O que mudar |
|---|---|
| `app/admin/menu/page.tsx` (linhas 851-878) | Substituir bloco de imagem por `<ImageUploadField folder="menu" />` |
| `app/admin/events/page.tsx` (linhas 452-483) | Substituir bloco de imagem por `<ImageUploadField folder="events" />` |
| `app/admin/gallery/page.tsx` (linhas 155-184) | Adicionar botao upload ao lado do input de URL |
| `app/admin/landing/page.tsx` (linhas 190-248) | Substituir input de URL por `<ImageUploadField folder="landing" />` |

### 4.4 Nenhuma mudanca necessaria em:

- `lib/supabase.ts` — cliente ja existe e ja tem auth
- `next.config.ts` — wildcard HTTPS ja permite URLs do Supabase
- `lib/schema.sql` — colunas `image_url`/`src` continuam sendo strings (agora com URLs do Supabase Storage)
- API routes — fluxo de salvar permanece identico (a URL muda, o formato nao)
- Public pages — ja renderizam qualquer URL de imagem

---

## 5. Otimizacao de Imagens (Client-Side)

Antes do upload, redimensionar e comprimir:

```ts
// Exemplo de logica
const MAX_WIDTH = 1920;
const QUALITY = 0.8;

// 1. Ler arquivo como Image
// 2. Desenhar em Canvas com dimensoes reduzidas
// 3. Exportar como JPEG/WEBP com qualidade 80%
// 4. Upload do blob comprimido
```

Beneficios:
- Foto de celular (4-8MB) vira ~200-500KB
- 1GB de storage comporta ~2000-5000 imagens
- Carregamento mais rapido no site publico

Para **videos**: nao comprimir client-side (complexo). Apenas validar tamanho maximo (50MB) e avisar o admin. Sugerir compressao externa antes do upload se necessario.

---

## 6. Consideracoes e Limites

### Limites do plano gratuito Supabase

| Recurso | Limite | Suficiente? |
|---|---|---|
| Storage | 1 GB | ~2000 imagens comprimidas ou ~20 videos |
| Bandwidth | 2 GB/mes | ~10.000 visualizacoes de imagem/mes |
| Requests | Ilimitado | Sim |

### Quando o storage encher

- Dashboard do Supabase mostra uso
- Opcao 1: Deletar imagens antigas pelo painel admin
- Opcao 2: Upgrade para Pro ($25/mes = 100GB)

### Modo local (sem Supabase)

- Upload **nao funciona** sem Supabase configurado
- O campo de URL manual continua disponivel como fallback
- Exibir aviso: "Upload requer Supabase configurado"

### Migracao de imagens existentes

- URLs existentes (Unsplash, Google, etc.) **continuam funcionando**
- Nenhuma migracao necessaria
- Novas imagens usam Supabase Storage
- Gradualmente, admin pode substituir URLs externas por uploads

---

## 7. Resumo do Esforco

| Tarefa | Complexidade | Tempo estimado |
|---|---|---|
| Criar bucket + RLS no Supabase | Baixa (manual, dashboard) | 5 min |
| `lib/upload.ts` | Media | 1h |
| `components/admin/ImageUploadField.tsx` | Media | 1-2h |
| Substituir nos 4 forms admin | Baixa | 1h |
| Testar upload + preview + save | Media | 1h |
| **Total** | | **~4-5h** |

---

## 8. Riscos e Mitigacoes

| Risco | Mitigacao |
|---|---|
| Storage gratuito esgotar | Comprimir imagens, monitorar uso, deletar antigas |
| Upload de arquivo muito grande | Validacao client-side (max 50MB), comprimir imagens |
| RLS mal configurado (anon upload) | Testar policies, garantir `authenticated` para insert |
| URLs externas quebrarem | Nao afetam novas imagens (Supabase URLs sao permanentes) |
| Admin nao logado tentar upload | RLS bloqueia, exibir mensagem de erro |
