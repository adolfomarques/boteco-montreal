---
name: Boteco Montreal
description: Tropical Professional — Brazilian energy with Montreal sophistication
colors:
  background: '#111415'
  surface-dim: '#111415'
  surface-bright: '#373a3b'
  surface-container-lowest: '#0c0f10'
  surface-container-low: '#191c1d'
  surface-container: '#1d2021'
  surface-container-high: '#282a2b'
  surface-container-highest: '#323536'
  on-background: '#e1e3e4'
  on-surface: '#e1e3e4'
  on-surface-variant: '#c3c8c1'
  outline: '#8d928c'
  outline-variant: '#434843'
  primary: '#b4cdb8'
  on-primary: '#203527'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  secondary: '#ffb77d'
  on-secondary: '#4d2600'
  secondary-container: '#9b5301'
  on-secondary-container: '#ffdec7'
  secondary-fixed: '#ffdcc3'
  tertiary: '#ffb596'
  on-tertiary: '#581e00'
  tertiary-container: '#501a00'
  on-tertiary-container: '#d47b53'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
typography:
  display:
    fontFamily: Anybody, cursive
    fontSize: clamp(2.5rem, 7vw, 4rem)
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline:
    fontFamily: Anybody, cursive
    fontSize: clamp(1.5rem, 4vw, 2rem)
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: Hanken Grotesk, sans-serif
    fontSize: clamp(1rem, 2.5vw, 1.125rem)
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Hanken Grotesk, sans-serif
    fontSize: 0.75rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.1em
    textTransform: uppercase
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  unit: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  gutter: 24px
  section-gap: 80px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
    padding: 24px 32px
  button-primary-hover:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
    padding: 24px 32px
  button-secondary:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.on-secondary}'
    rounded: '{rounded.md}'
    padding: 24px 32px
  button-secondary-hover:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.on-secondary}'
    rounded: '{rounded.md}'
    padding: 24px 32px
  button-outline:
    backgroundColor: transparent
    textColor: '{colors.on-surface}'
    rounded: '{rounded.md}'
    padding: 24px 32px
    border: 2px solid {colors.outline-variant}
  glass-card:
    backgroundColor: rgba(36, 59, 43, 0.4)
    textColor: '{colors.on-surface}'
    rounded: '{rounded.lg}'
    padding: 16px
  glass-panel:
    backgroundColor: rgba(36, 59, 43, 0.4)
    textColor: '{colors.on-surface}'
    rounded: '{rounded.xl}'
    padding: 32px
---

# Design System: Boteco Montreal

## 1. Overview

**Creative North Star: "The Tropical Professional"**

Boteco Montreal's visual language bridges the warmth of a Brazilian boteco with the polish of a Montreal dining institution. The system lives in the tension between *vibrant* and *sophisticated* — bold enough to capture the energy of samba and caipirinhas, restrained enough to let the food and atmosphere take center stage.

The palette is dark and warm: deep forest backgrounds (`#111415`) with amber secondary accents (`#ffb77d`) that glow like candlelight or a setting Rio sun. Typography pairs Anybody's confident, slightly condensed display weight (800) with Hanken Grotesk's clean readability for body text — a geometric sans that stays legible at small sizes but doesn't compete for attention.

The system explicitly rejects: SaaS-template clichés (Inter, purple gradients, icon-tile grids), over-minimal "clean" restaurant sites, nested cards, and gray text on colored backgrounds.

**Key Characteristics:**
- Dark, warm, high-contrast — light text (`#e1e3e4`) on deep surfaces
- Single accent hierarchy: secondary amber carries interactive energy; primary green provides calm structural support; tertiary coral adds warmth for special moments
- Glassmorphism for overlays and cards — subtle blur + green-tinted translucent backgrounds
- Rhythmic spacing based on 4px unit, with generous section gaps (80px)
- Bold, uppercase label caps (12px, 0.1em letter-spacing) as rhythmic punctuation

## 2. Colors

The palette is organized around warm darkness punctuated by luminous accents. Backgrounds are deep and enveloping; accents glow against them.

### Primary
- **Calm Green** (`#b4cdb8`): Used for neutral structural elements — secondary headings, subdued badges, inverse surfaces. Never the primary action color. Represents growth, freshness, the herbal notes in a caipirinha.

### Secondary
- **Amber Glow** (`#ffb77d`): The action color. Buttons, links, interactive accents, hover states, icons, and timeline highlights. Warm, luminous, inviting. Carries ~10% of any given screen. This is the "call to caipirinha" color.

### Tertiary
- **Coral Ember** (`#ffb596`): Used for warmth in special contexts — event badges, highlight borders, celebratory accents. Softer than secondary, reserved for secondary content and chips.

### Neutral
- **Deep Forest** (`#111415`): Primary background and surface. Dark but not black — a warm near-black with subtle green undertone.
- **Surface Container** scale (`#0c0f10` → `#373a3b`): Six-step tonal ramp for cards, elevated surfaces, and containers. Layered via background color, not shadows.
- **Warm White** (`#e1e3e4`): Body and heading text. Not pure white — a warm off-white that reads softly against the dark background.
- **Muted Sage** (`#c3c8c1`): Secondary text, placeholders, disabled states.
- **Iron Veil** (`#8d928c` / `#434843`): Outlines and dividers. The lighter value is used for borders against dark surfaces; the darker for subtle subdivision.

### Named Rules
**The Amber Rule.** The secondary amber (`#ffb77d`) is the sole interactive accent. Primary green never acts as a button or link. Tertiary coral never competes with amber for action hierarchy. The rule keeps the interface instantly scannable: if it's amber, you can click it.

**The Glass Rule.** Translucent green-tinted backgrounds (`rgba(36, 59, 43, 0.4)`) with backdrop blur are the default card/container treatment. Pure solid backgrounds are reserved for the page canvas, nav, and modals.

## 3. Typography

**Display Font:** Anybody (weight 600–800, with cursive italic axis)
**Body Font:** Hanken Grotesk (weight 400–700)

**Character:** Anybody's tightly spaced, slightly condensed display forms carry the restaurant's personality — bold, rhythmic, a touch theatrical at large sizes. Hanken Grotesk steps back and lets the content breathe: clean, neutral, quietly professional. The contrast is deliberate: display screams, body whispers.

### Hierarchy
- **Display** (800, `clamp(2.5rem, 7vw, 4rem)`, 1.1, -0.02em): Hero headlines only. Uppercase when brand-facing. Never used for body content.
- **Headline** (700, `clamp(1.5rem, 4vw, 2rem)`, 1.2): Section titles and card headers.
- **Body** (400, `clamp(1rem, 2.5vw, 1.125rem)`, 1.5, max 75ch): All prose. Paragraphs, descriptions, reservation form labels.
- **Label** (700, `12px`, 1, 0.1em, uppercase): Smallest visible type. Used for badges, category tags, timestamps, admin table headers, and any meta information. The uppercase + wide tracking creates rhythmic punctuation across the layout.

### Named Rules
**The Label Caps Rule.** `font-label-caps` (12px, 700 weight, 0.1em letter-spacing, uppercase) is the only micro-type treatment. Never use a smaller size or lower weight for metadata. The consistent capsule rhythm unifies the otherwise varied layout.

## 4. Elevation

The system uses **tonal layering by background color** rather than drop shadows for depth. Six surface container levels progress from `surface-container-lowest` (`#0c0f10`) to `surface-container-highest` (`#323536`), each stepping lighter as elevation increases. Cards and panels use the glass-card treatment (backdrop blur + translucent green-tinted background) for a floating effect.

Shadows exist but are reserved for interactive hover states only — buttons, interactive cards, and dropdowns — never for static containers.

### Shadow Vocabulary
- **Button Glow** (`0 4px 24px rgba(255, 183, 125, 0.2)`): Applied to secondary (amber) buttons at rest. The shadow matches the button color, creating a warm glow effect.
- **Hover Lift** (`0 8px 32px rgba(0, 0, 0, 0.3)`): Applied to interactive cards and panels on hover.

## 5. Components

### Buttons
- **Shape:** Rounded (8px radius), with 24px horizontal / 12–16px vertical padding.
- **Primary:** Amber background (`#ffb77d`), dark text (`#4d2600`). Carries a warm glow shadow (`0 4px 24px rgba(255, 183, 125, 0.2)`). Hover: `brightness(110%)` or `scale(1.01-1.05)` depending on context. Active: `scale(0.95)`. Transition: all 200ms.
- **Secondary (green):** Calm green background (`#b4cdb8`), dark text (`#203527`). Used for secondary CTAs on admin surfaces and quiet confirmation actions.
- **Outline:** 1–2px border (`#434843`), transparent background, light text (`#e1e3e4`). Hover: subtle background fill (`rgba(255,255,255,0.05)` or `bg-surface-variant`). Used for "learn more" or secondary navigation.
- **Ghost:** Transparent, muted text (`#c3c8c1`). Hover: amber text + subtle background. Used for tertiary actions and dismissals.

### Glass Card / Panel
- **Shape:** Rounded corners (12px for cards, 16px for panels).
- **Background:** Translucent green-tinted (`rgba(36, 59, 43, 0.4)`), backdrop blur (8px for cards, 12px for panels).
- **Border:** 1px subtile white border (`rgba(255, 255, 255, 0.08–0.10)`).
- **Padding:** 16px (card) / 32px (panel) internal.
- **Shadow:** None at rest. Interactive variant gets a hover shadow + border color shift to amber.

### Badges / Chips
- **Style:** transparent background with 10% opacity of respective color (`bg-secondary/10`), matching text color, uppercase label-caps typography.
- **Shape:** Pill (rounded-full) by default, or sharp (rounded) for calendar-style day labels.
- **Variants:** Primary (green), Secondary (amber), Tertiary (coral), Outline (bordered), Ghost (solid high-container background).

### Inputs / Fields
- **Style:** Dark container background (`bg-surface-container-low`, `#191c1d`), subtle border (`outline-variant/20`), rounded (8px). Padding: 16px all sides.
- **Focus:** Amber ring (`ring-2 ring-secondary/50`) + border shifts to amber.
- **Error:** Red border + ring (`border-error/50 focus:ring-error/50`).
- **Disabled:** 50% opacity + lowest container background.

### Navigation
- **Style:** Fixed top bar with glass-like background (`bg-surface-dim/80 backdrop-blur-md`), transparent at rest, subtle bottom border on scroll.
- **Links:** Uppercase label-caps, muted by default, amber on hover/active. Current page indicated by amber bottom border.
- **Mobile:** Collapsed hamburger with fullscreen overlay drawer.

## 6. Do's and Don'ts

### Do:
- **Do** use the secondary amber (`#ffb77d`) as the primary interactive color — buttons, links, interactive accents.
- **Do** use glass-card treatment (backdrop blur + translucent green-tinted backgrounds) for cards and containers.
- **Do** use tonal background layering instead of shadows for elevation.
- **Do** keep body line length between 65–75 characters.
- **Do** use `text-wrap: balance` on headings for even line lengths.
- **Do** use the 4px spacing unit rhythmically — vary spacing for visual breathing room.

### Don't:
- **Don't** use gray text on colored backgrounds — always use a darker shade of the background's own hue, or a transparency of the text color.
- **Don't** use primary green (`#b4cdb8`) for buttons or interactive elements — that's amber's job.
- **Don't** nest cards inside cards — it collapses hierarchy and violates the glass rule.
- **Don't** use bounce/elastic easing — feels dated and distracts from content.
- **Don't** use Inter, system-ui, or Arial as the primary font — the Anybody + Hanken pairing is brand-defining.
- **Don't** use purple-to-blue gradients or rounded-square icon tiles above headings (generic SaaS tells).
- **Don't** use pure black or pure white — always tint (`#111415` not `#000`, `#e1e3e4` not `#fff`).
- **Don't** use arbitrary z-index values above 100 — use the semantic scale: dropdown (10) → sticky (20) → modal-backdrop (30) → modal (40) → toast (50) → tooltip (60).
