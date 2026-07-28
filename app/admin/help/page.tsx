'use client';

import React from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';

interface HelpSection {
  icon: string;
  title: string;
  color: string;
  items: string[];
}

const SECTIONS: HelpSection[] = [
  {
    icon: 'restaurant_menu',
    title: 'Cardápio',
    color: 'text-secondary',
    items: [
      'Adicione itens com o botão "Novo Item" — preencha nome e descrição nos 3 idiomas (PT / FR / EN) e o preço em CAD.',
      'Envie a foto do prato direto do seu computador ou cole uma URL de imagem.',
      'Arraste os itens para mudar a ordem em que aparecem no site.',
      'Use "Ajuste Global" para aumentar ou reduzir todos os preços por percentual de uma vez.',
      'Itens marcados como "Destaque" aparecem com foto grande na página do cardápio.',
      'Desative um item para escondê-lo do site sem apagá-lo.',
    ],
  },
  {
    icon: 'flatware',
    title: 'NOSSA COZINHA',
    color: 'text-tertiary',
    items: [
      'São os 3 pratos em destaque na página inicial.',
      'Use "Importar" para puxar nome, preço e foto de um item já cadastrado no cardápio.',
      'Ou preencha manualmente e envie uma foto exclusiva.',
      'Não esqueça de clicar em "Salvar" ao final — as mudanças só valem após salvar.',
    ],
  },
  {
    icon: 'event',
    title: 'Eventos',
    color: 'text-secondary',
    items: [
      'Cadastre os eventos semanais com dia, horário, título e descrição nos 3 idiomas.',
      'O botão de destaque (estrela) marca o evento principal — apenas um evento pode estar destacado por vez.',
      'Arraste para reordenar os eventos na página.',
      'Desative um evento para escondê-lo temporariamente do site.',
    ],
  },
  {
    icon: 'photo_library',
    title: 'Galeria',
    color: 'text-tertiary',
    items: [
      'Fotos e vídeos que aparecem no carrossel da página inicial.',
      'Envie arquivos direto do computador ou cole uma URL.',
      'Vídeos devem ter no máximo 50MB — comprima antes se necessário.',
      'Use o toggle para ativar/desativar itens sem apagá-los.',
      'Arraste os cards para definir a ordem de exibição.',
    ],
  },
  {
    icon: 'event_seat',
    title: 'Reservas',
    color: 'text-secondary',
    items: [
      'Todas as reservas feitas pelos clientes no site aparecem aqui.',
      'Confirme ou cancele cada reserva pelos botões de ação.',
      'Status: Pendente (nova), Confirmada ou Cancelada.',
      'Entre em contato com o cliente pelo telefone ou e-mail informado na reserva.',
    ],
  },
  {
    icon: 'settings',
    title: 'Configurações',
    color: 'text-tertiary',
    items: [
      'Endereço, telefone e e-mail exibidos no rodapé e na página de reservas.',
      'Horários de funcionamento de cada dia da semana.',
      'Links das redes sociais (Instagram, Facebook, Google).',
      'Sempre clique em "Salvar" após editar.',
    ],
  },
  {
    icon: 'cloud_upload',
    title: 'Upload de Imagens',
    color: 'text-secondary',
    items: [
      'Clique em "Selecionar imagem" e escolha uma foto do seu computador — ela é comprimida automaticamente para carregar rápido no site.',
      'Vídeos não são comprimidos: envie arquivos de até 50MB.',
      'Prefere usar uma imagem da internet? O campo de URL continua disponível em todos os formulários.',
      'As imagens enviadas ficam salvas na nuvem com link permanente.',
    ],
  },
  {
    icon: 'cloud',
    title: 'Modo Local vs. Nuvem',
    color: 'text-tertiary',
    items: [
      'O aviso "Modo local" indica que os dados estão sendo salvos apenas no navegador deste computador.',
      'Com o Supabase conectado, tudo é salvo na nuvem e aparece em qualquer dispositivo.',
      'O upload de imagens só funciona com a nuvem conectada.',
    ],
  },
];

const FAQ = [
  {
    q: 'Fiz uma alteração mas ela não aparece no site.',
    a: 'Verifique se você clicou em "Salvar" dentro da seção que editou. A página pública pode levar alguns segundos para atualizar — tente recarregar com Cmd+Shift+R (Mac) ou Ctrl+F5 (Windows) para limpar o cache.',
  },
  {
    q: 'Como destaco um evento na página de eventos?',
    a: 'Na lista de eventos, clique na estrela do evento desejado. Apenas um evento pode estar destacado por vez — ao destacar um novo, o anterior perde o destaque automaticamente.',
  },
  {
    q: 'A imagem que eu colei por URL não aparece.',
    a: 'Confirme que a URL é pública (abre em uma aba anônima do navegador) e termina em um formato de imagem (.jpg, .png, .webp). Se preferir, envie o arquivo direto do computador — é mais garantido.',
  },
  {
    q: 'Como mudo a ordem dos itens?',
    a: 'No cardápio, eventos e galeria, basta arrastar o item e soltar na posição desejada. A ordem é salva automaticamente.',
  },
  {
    q: 'Posso esconder um item sem apagar?',
    a: 'Sim. Use o toggle de ativo/inativo no cardápio, eventos e galeria. O item some do site mas continua salvo no painel.',
  },
  {
    q: 'Como altero todos os preços de uma vez?',
    a: 'Na página do Cardápio, use o botão "Ajuste Global", informe o percentual (ex: 10 para aumentar 10%, -5 para reduzir 5%) e confirme.',
  },
];

export default function AdminHelpPage() {
  return (
    <>
      <AdminTopBar title="Central de Ajuda" />

      <div className="p-gutter max-w-container-max w-full mx-auto space-y-6 pb-24">
        {/* Intro */}
        <div className="glass-card rounded-xl p-6 flex items-start gap-4">
          <span className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">help</span>
          </span>
          <div>
            <h2 className="font-headline-sm text-on-surface">Bem-vindo ao painel do Boteco</h2>
            <p className="text-on-surface-variant text-sm mt-1 max-w-2xl">
              Aqui você gerencia todo o conteúdo do site: cardápio, eventos, fotos, reservas e informações do restaurante.
              Use os guias abaixo para aprender cada seção.
            </p>
          </div>
        </div>

        {/* Sections grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SECTIONS.map((section) => (
            <div key={section.title} className="glass-card rounded-xl p-6 border border-outline-variant/10">
              <h3 className="font-bold text-on-surface flex items-center gap-3 mb-4">
                <span className={`material-symbols-outlined ${section.color}`}>{section.icon}</span>
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.items.map((item, i) => (
                  <li key={i} className="text-sm text-on-surface-variant flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-sm mt-0.5 shrink-0">check</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="glass-card rounded-xl p-6 border border-outline-variant/10">
          <h3 className="font-bold text-on-surface flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-secondary">quiz</span>
            Perguntas Frequentes
          </h3>
          <div className="divide-y divide-outline-variant/10">
            {FAQ.map((item, i) => (
              <details key={i} className="group py-3 first:pt-0 last:pb-0">
                <summary className="flex items-center justify-between gap-3 cursor-pointer text-sm font-bold text-on-surface hover:text-secondary transition-colors list-none">
                  {item.q}
                  <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform shrink-0">
                    expand_more
                  </span>
                </summary>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="glass-card rounded-xl p-6 border border-secondary/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">support_agent</span>
          </span>
          <div className="flex-1">
            <h3 className="font-bold text-on-surface">Precisa de ajuda técnica?</h3>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Se algo não estiver funcionando como esperado, entre em contato com o suporte do site.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
