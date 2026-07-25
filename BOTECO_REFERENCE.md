# 🇧🇷 Boteco Montreal — Informações de Referência

> Este arquivo centraliza todas as informações do restaurante usadas no site.
> Atualize os valores abaixo conforme necessário e o site refletirá automaticamente.

---

## 📞 Contato

| Campo | Valor Atual | Status |
|---|---|---|
| Telefone | `(514) 903-0730` | ✅ Real |
| Email público | `ola@botecomontreal.com` | ✅ OK |
| Email admin | `admin@botecomontreal.com` | ⚠️ Placeholder — substituir |

## 📍 Endereço

| Campo | Valor Atual | Status |
|---|---|---|
| Endereço completo | `5414 Av. Gatineau, Montreal, QC H3T 1L9` | ✅ Real |
| Cidade | Montreal | ✅ OK |

## 🕐 Horários

| Dia | Horário |
|---|---|
| Segunda (Lun / Mon) | Fechado |
| Terça (Mar / Tue) | 15h - 23h (3PM - 11PM) |
| Quarta (Mer / Wed) | 15h - 23h (3PM - 11PM) |
| Quinta (Jeu / Thu) | 15h - 23h (3PM - 11PM) |
| Sexta (Ven / Fri) | 15h - 01h (3PM - 1AM) |
| Sábado (Sam / Sat) | 15h - 01h (3PM - 1AM) |
| Domingo (Dim / Sun) | 15h - 23h (3PM - 11PM) |

## 🌐 Redes Sociais

| Rede | Link |
|---|---|
| Instagram | `https://www.instagram.com/BotecoMontreal` |
| Handle | `@BotecoMontreal` |
| Facebook | `https://www.facebook.com/BotecoMontreal` |
| Hashtag | `#BOTECOMONTREAL` |

## ⭐ Avaliações

| Plataforma | Nota |
|---|---|
| Google | 4.9 / 5 ⭐ |

## 📁 Onde os dados estão no código

| Arquivo | O que contém |
|---|---|
| `lib/data/restaurant.ts` | **Fonte centralizada** de todas as infos do restaurante |
| `lib/data/events.ts` | Eventos semanais (karaokê, samba, feijoada) |
| `lib/data/menu.ts` | Cardápio (entradas, pratos, bebidas) |
| `lib/i18n/translations.ts` | Traduções (FR/PT/EN) — endereço, horários, footer |
| `components/public/Footer.tsx` | Footer (lê de translations.ts) |
| `components/public/SocialGallery.tsx` | Galeria de fotos / Instagram |
| `components/public/HeroSection.tsx` | Hero (hashtag, rating, avatars) |
| `app/(public)/reservas/page.tsx` | Endereço no mapa / contato |

## 🔧 Como atualizar

### Opção 1: Rápido (editar traduções)
Edite `lib/i18n/translations.ts` nas linhas:
- Footer/endereço: linhas ~144, ~401, ~658
- Footer/horários: linhas ~145-152, ~402-409, ~659-666
- Footer/telefone: linhas ~117, ~374, ~631
- Hero/rating: linhas ~24, ~281, ~538

### Opção 2: Centralizado (recomendado)
Edite `lib/data/restaurant.ts` e depois atualize os componentes para lerem de lá.
