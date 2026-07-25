# Boteco Montreal — Plano de Desenvolvimento

> Salvo em 06/07/2026

---

## ✅ Finalizado

### Design System
- Tokens de cor, tipografia, spacing, border radius em `globals.css`
- 5 componentes UI: Button, Input, Select, Badge, GlassCard
- Utilitários de tipografia: `font-display-lg`, `font-display-mobile`, `font-headline-md`, `font-headline-sm`, `font-body-lg`, `font-body-md`, `font-label-caps`, `font-admin-table`
- DESIGN.md documentado com personalidade, cores, regras nomeadas

### Internacionalização (i18n)
- 3 idiomas: Francês (fr), Português (pt), Inglês (en)
- ~89 chaves por idioma, 267 no total
- Sistema custom: cookie + localStorage + LanguageProvider context
- Cobre: nav, hero, eventos, menu preview, galeria, reserva, menu page, eventos page, reservas page, footer, common

### Páginas Públicas
- **Home** (`/`): Hero + Events + Menu Preview + Social Gallery + Reservation CTA
- **Menu** (`/menu`): Navegação por categorias, items com imagens/preços, Supabase + fallback
- **Eventos** (`/eventos`): Hero promovido, grade semanal, seção de eventos privados
- **Reservas** (`/reservas`): Formulário funcional com Supabase + fallback, informações de contato

### Componentes
- Navbar com scroll detection, menu mobile, language switcher
- Footer com links, horários, contato, copyright, 3 idiomas
- HeroSection, EventsSection, MenuPreviewSection, SocialGallery, ReservationSection, ReservationForm
- LanguageSwitcher (FR/PT/EN)

### Admin
- AuthProvider com Supabase Auth + verificação de admin
- AuthGuard para proteção de rotas
- AdminSidebar com navegação e logout
- AdminTopBar com search/notificações (UI only)
- Login page funcional
- Dashboard com cards de estatísticas (dados demo)

### Database
- Schema SQL completo: 6 tabelas (menu_categories, menu_items, events, reservations, site_settings, admin_users)
- Índices, triggers de updated_at, seed data
- Lib de queries: menu (CRUD), events (CRUD), reservations (CRUD)

### Infra
- Graceful degradation: Supabase opcional, fallback data quando offline
- Tailwind v4, Next.js 16, React 19, TypeScript

---

## ⚠️ Parcial

- **Admin Menu** — lê e edita inline, mas não cria nem deleta itens; upload de imagem é fachada
- **Formulário de Reserva** — faltam campos nome e email; form da homepage não tem `onSubmit`
- **Admin Dashboard** — todas estatísticas são dados demo hardcoded, não conectadas ao Supabase
- **Fallback data** — menu e eventos hardcoded só em francês; trocar idioma sem Supabase não traduz
- **AdminSidebar** — `font-display-lg` com `tracking-tight` e `text-headline-sm` (uso confuso)
- **Botão "View All" no Dashboard** — visual only

---

## ❌ Não Implementado

### CRUD Admin
- Admin Eventos (`/admin/events`) — placeholder vazio
- Admin Reservas (`/admin/reservations`) — placeholder vazio
- Admin Configurações (`/admin/settings`) — placeholder vazio

### API & Backend
- API routes (`app/api/`) — zero endpoints
- Server Actions — não implementadas
- Image upload — nenhuma lógica de upload real
- Conexão Supabase real — `.env.local` usa placeholders (`your-project.supabase.co`)

### Páginas Faltando
- `/privacy` — linked no footer, não existe
- `/terms` — linked no footer, não existe
- `/careers` — linked no footer, não existe
- Página de contato — não existe
- Newsletter — não existe

### Bugs / Débitos Técnicos
- **Tipografia**: `text-[10px]` sobrescreve `font-label-caps` em ~25 lugares (viola Label Caps Rule do DESIGN.md)
- **Tipografia**: CTAs usam `font-headline-sm text-[18px] font-bold` em vez de utility dedicada
- **Tipografia**: Classes redundantes (`font-label-caps` + `uppercase`, `font-label-caps` + `tracking-widest`)
- **Tipografia**: Button.tsx usa Tailwind genérico (`text-xs`/`sm`/`base`) em vez das utilities do sistema
- **Data dura**: "VENDREDI, 03 JUILLET" hardcoded em eventos
- **Mapa**: Link "Abrir no Maps" href é `#`
- **Rede social**: `@BotecoMontreal` hardcoded na SocialGallery

### Performance & Qualidade
- `next/image` não usado — todas as imagens usam `<img>` tradicional
- Loading states — páginas assíncronas sem Suspense boundaries
- SEO metadata — menu, eventos e reservas sem `<head>` metadata próprio
- Error boundaries — não implementados
- Testes — zero (jest, cypress, playwright)
- Form library — raw HTML, sem react-hook-form
- Date library — sem date-fns/dayjs, datas como string crua
- Animações — sem framer-motion/gsap

---

## Prioridade Sugerida

1. **Conectar Supabase real** — desbloqueia todo o resto
2. **Corrigir formulário de reserva** — nome/email + onSubmit da homepage
3. **Completar CRUD admin** — criar/deletar menu items, admin eventos + reservas
4. **Corrigir tipografia** — `text-[10px]`, utility CTA, redundâncias
5. **Criar API routes** — segurança (não expor anon key no client)
6. **Páginas faltando** — privacy, terms, contact
7. **Performance** — next/image, Suspense, SEO metadata
