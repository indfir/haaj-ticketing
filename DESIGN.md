# DESIGN.md — HAAJ Ticketing Design System

## Typeface Pairing

| Role | Typeface | Weight | Notes |
|------|----------|--------|-------|
| Display / Headings | Instrument Serif | 400 | Editorial serif. Used for h1–h4, large display text. |
| UI / Body | Inter Tight | 300–600 | Grotesk sans. Clean, high x-height, pairs well with Instrument Serif. |
| Monospace / Data | IBM Plex Mono | 400 | Ticket codes, numeric data columns, technical strings. |

**Justification:** Instrument Serif brings warmth and editorial character without feeling precious. Inter Tight is a modern grotesk with tight letter-spacing that reads well at small sizes. Together they create a clear hierarchy: serif for editorial moments, sans for functional UI, mono for data.

## Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `display-xl` | 64px / 4rem | 1.05 | Hero headings |
| `display-lg` | 48px / 3rem | 1.1 | Page headings |
| `display-md` | 32px / 2rem | 1.15 | Section headings |
| `display-sm` | 24px / 1.5rem | 1.2 | Card titles, sub-sections |
| `body-lg` | 18px / 1.125rem | 1.6 | Lead paragraphs |
| `body` | 16px / 1rem | 1.6 | Default body text |
| `body-sm` | 14px / 0.875rem | 1.5 | Secondary text, captions |
| `caption` | 12px / 0.75rem | 1.5 | Labels, timestamps, metadata |

`text-wrap: balance` on headings. `text-wrap: pretty` on paragraphs.

## Colour Tokens

### Light Theme
| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#FAFAF8` | Page background, warm off-white paper |
| `--foreground` | `#1A1A19` | Primary text, near-black ink |
| `--muted` | `#F0EFEC` | Subtle background shifts |
| `--muted-foreground` | `#6B6966` | Secondary text |
| `--card` | `#FFFFFF` | Card surfaces |
| `--border` | `#E5E4E0` | Hairline borders (~8% ink) |
| `--accent` | `#B48E5A` | Warm copper/amber — primary actions, links |
| `--accent-foreground` | `#FFFFFF` | Text on accent |

### Dark Theme
| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#0F1115` | Deep charcoal, not pure black |
| `--foreground` | `#ECE9E4` | Warm off-white text |
| `--muted` | `#1A1C22` | Subtle background shifts |
| `--muted-foreground` | `#8A8680` | Secondary text |
| `--card` | `#16181E` | Card surfaces |
| `--border` | `#2A2C32` | Hairline borders |
| `--accent` | `#C9A46C` | Warm copper/amber — adjusted for dark bg |
| `--accent-foreground` | `#0F1115` | Text on accent |

### Semantic
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--success` | `#4A7C59` | `#5E9A70` | Confirmed, checked-in |
| `--warning` | `#A07D3A` | `#C4A24E` | Pending, waitlisted |
| `--destructive` | `#A0453A` | `#C45A4E` | Rejected, errors |
| `--info` | `#4A6A8C` | `#6A92B8` | Informational |

All semantic colours are muted and desaturated. Status badges pair colour with a text label — never colour alone.

## Spacing Scale

4px base unit. All spacing uses multiples:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96`

## Elevation

**Zero shadows.** Elevation and grouping are expressed through:

1. **Hairline borders** — 1px solid `var(--border)`
2. **Background tone shifts** — `var(--background)` → `var(--card)` → `var(--muted)`
3. **Spacing** — generous whitespace between groups

## Border Radius

Small and consistent:
- Default: `4px` (`rounded-md` in Tailwind)
- Larger containers: `8px` (`rounded-lg`)
- Never pill-shaped globally

## Motion

- Duration: 150–250ms
- Easing: `ease-out`
- Properties: `opacity`, `translate` only
- No spring bounces, no scroll-jacking
- Respects `prefers-reduced-motion`

## Focus

Every interactive element has a visible `:focus-visible` ring:
- 2px solid `var(--ring)` (accent-derived)
- 2px offset
