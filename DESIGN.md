# DESIGN.md

Design system for the Omakase static site (`site/`). Aesthetic lane: retro shōwa-era Japanese travel poster crossed with a kaiseki tasting menu, with brushed sumi-ink accents.

## Color

Strategy: full palette, committed. Four named inks on paper, used like a screen-printed poster — large flat fields, no gradients.

| Token | OKLCH | Hex (approx) | Role |
|---|---|---|---|
| `--paper` | oklch(0.95 0.025 90) | #f3ead3 | Page ground, "menu paper" |
| `--paper-dim` | oklch(0.91 0.035 88) | #e7dab8 | Aged-paper tint for inset panels |
| `--ink` | oklch(0.24 0.015 60) | #2a221b | Line work, body text, dark panels |
| `--ink-soft` | oklch(0.38 0.02 60) | | Secondary text on paper |
| `--vermillion` | oklch(0.60 0.20 33) | #d93a1f | Primary poster color; carries 30–50% of the surface |
| `--vermillion-deep` | oklch(0.52 0.19 32) | | Page surround, small red text on paper |
| `--blossom` | oklch(0.76 0.11 350) | #e393bd | Secondary fill; panel backgrounds, accents |
| `--blossom-light` | oklch(0.85 0.07 350) | | Tinted card and strip backgrounds |

Never pure #000/#fff. Dark panels are `--ink`, light text on them is `--paper`.

## Typography

- Display: **RocknRoll One** (Google Fonts) — retro Japanese poster letterforms, covers Latin + kana/kanji. Headings, big numerals, hero.
- Menu serif: **Shippori Mincho** (Google Fonts) — fine-dining mincho. Course names, body copy, Japanese labels (including vertical text).
- Code: **JetBrains Mono** — terminal/order-ticket blocks only.
- Scale ratio ≥1.333; hero display uses fluid `clamp()`. Body 1rem/1.7 Shippori Mincho.
- All-caps and letter-spaced labels get `letter-spacing: 0.08em+`.

## Texture & Ornament

- Checkered border framing the page (CSS `repeating-conic-gradient`, vermillion/paper), as on retro matchbox labels.
- Halftone speckle: CSS radial-gradient dot fields on panel backgrounds (pink-on-ink, ink-on-pink).
- Thick ink borders: 3px solid `--ink` on panels; panels sit edge-to-edge like poster blocks, with hard offset shadows (no blur).
- Brushed sumi accents: SVG brush-stroke underlines and an ensō circle; rough edges via SVG `feTurbulence` displacement, used sparingly.
- Hanko seals: red circular/square stamp marks (合 / 検) as pass/quality motifs.
- Vertical Japanese labels (`writing-mode: vertical-rl`) on panel edges.

## Layout

- Poster-panel composition: asymmetric grid of bordered panels, not a centered card stack.
- Menu sections read as kaiseki courses: kanji numeral + course name + dotted leader rows.
- Spacing on a 4pt scale; section rhythm varies (tight menu rows vs. generous course breaks).
- Body measure ≤ 70ch.

## Motion

- Page-load: short staggered reveal of hero panels (translate + fade, ease-out-quint, ≤500ms).
- Hover: menu rows tint vermillion; panels lift 2px with hard shadow growth. No bounce, no scroll-jacking.
- Living poster: the hero Fuji panel carries ambient print motion (cloud drift, sun pulse, wind ripple, speckle shimmer) plus gentle cursor parallax across four depth layers (sun deepest, wind lines nearest). Subtle enough to read as static in a screenshot.
- Hanko slam: the 合格 seal slams in (scale overshoot, ease-out-quint), the neighboring quote jolts at impact, ink specks pop with stagger. The seal carries the rough-ink turbulence filter so edges look hand-pressed.
- Section delights: every section carries one tiny ambient touch (≤3px or a color breath, 4–8s cycles, staggered): enso turns, kana circles bob, ramen steam rises, an ink wave crosses the menu numerals, the knife rocks / stamp re-inks / scroll sways, the 検 numbers glint, the order ticket's cursor blinks, maru/batsu breathe, footer sushi bob. One touch per section, never two.
- All motion sits behind `prefers-reduced-motion: no-preference`; the static state is complete (stamp shown pressed, specks visible).

## Bans (project-specific)

- No gradients except dot/checker patterns. No blur shadows, no glassmorphism, no neon.
- No stock photography; all imagery is flat 4-color SVG illustration in the poster style.
- No kawaii mascots or emoji.
