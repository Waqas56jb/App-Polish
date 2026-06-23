# SERVIFY — Design System / Theme Reference

> Applied to BRÄVE Studio frontend. Calm, premium, editorial wellness aesthetic — "sage / cream theme".
> Soft natural greens + warm off-white backgrounds, elegant serif headlines + clean modern sans-serif.
> Lots of whitespace, rounded pill buttons, subtle shadows, gentle hover lifts, float/pulse animations.

## Color Palette (HEX)

| Role | Name | HEX | Usage |
|------|------|-----|-------|
| Primary | Sage | `#8BAF8D` | Brand accent, CTA bg, links, icons, italic highlights |
| Primary hover | Sage Dark | `#759E77` | Hover state for sage buttons |
| Secondary | Sage Light | `#C8DEC9` | Big numerals, borders, soft accents |
| Tint | Sage Pale | `#EEF4EE` | Icon backgrounds, hover fills, tag chips |
| Background | Cream | `#FAF7F2` | Main page background |
| Surface | Warm | `#F2ECE3` | Alternate section bg, image panel bg |
| Surface | White | `#FFFFFF` | Cards, "how it works" |
| Text Dark | Charcoal | `#2A2A28` | Headings, body, dark sections, footer |
| Text Mid | Mid | `#5C5C58` | Sub-text, paragraphs |
| Text Muted | Muted | `#9A9A94` | Captions, labels, meta |
| Accent | Gold | `#C9A96E` | Star ratings, premium accents |
| Accent | Gold Light | `#E8D5B0` | Soft gold highlights |
| Success | Green dot | `#4CAF50` | Live/online indicator |
| Border | — | `rgba(42,42,40,0.1)` | Dividers, card borders |
| Border soft | — | `rgba(42,42,40,0.06)` | Nav border, light dividers |

## Typography

- **Headings / Display:** `'Cormorant Garamond', serif` — light weight (300–400), italic accents in sage.
- **Body / UI:** `'DM Sans', sans-serif` — weights 300–700.
- Hero title: `clamp(3rem, 5vw, 5.2rem)`, weight 300, lh 1.05, ls -0.01em. Accent word italic + sage.
- Section title: `clamp(2.2rem, 3.5vw, 3.2rem)`, weight 300.
- Eyebrow label: 0.72rem, weight 500, ls 0.12em, UPPERCASE, sage, preceded by 24px×1px sage dash.
- Body: 0.88–1rem, weight 300, lh 1.6–1.75, color Mid.
- Buttons: 0.82rem, weight 500, ls 0.06em, UPPERCASE.

## Buttons (pill, radius 40px)

- **Primary:** charcoal bg, cream text → hover sage + lift -1px.
- **Sage:** sage bg, white text, pad 0.9rem 2.2rem → hover #759E77 + lift -2px.
- **Outline:** transparent, 1.5px charcoal border → hover fills charcoal.
- **White (on sage):** white bg, sage text → hover cream.
- **Ghost:** text-only, mid → hover charcoal.

## Components

- **Nav:** fixed, semi-transparent cream `rgba(250,247,242,0.88)` + `backdrop-filter: blur(14px)`, soft bottom border.
- **Cards:** radius 20px, white, shadow `0 2px 20px rgba(0,0,0,0.04)` → hover lift -4px + `0 12px 40px rgba(0,0,0,0.1)`. Images zoom `scale(1.05)`.
- **Icon tiles:** 48px, radius 12px, sage-pale bg, sage stroke icons (stroke-width 1.5, no fill).
- **Tags/chips:** sage text on sage-pale, radius 20px, small uppercase.
- **Floating badges:** white, radius 16px, shadow `0 20px 60px rgba(0,0,0,0.12)`, float anim.
- **Dark sections:** charcoal bg; white text reduced opacity; accents sage-light & gold.
- **Decorative circles:** large soft sage-pale / translucent-white circles bleeding off edges.

## Animations

- `floatUp`: ±8px vertical, 3s ease-in-out infinite.
- `pulse`: opacity 1↔0.4, 1.5s (live dot).
- `fade-up`: opacity 0→1, translateY(30px)→0, 0.7s ease.
- Hover: 0.2–0.4s transform/bg; images 0.5–0.6s. `scroll-behavior: smooth`.

## Layout & Spacing

- Section padding: `6rem 8%` desktop → `4rem 5%` mobile.
- Grids: 4-col → 2-col ≤1024px → 1-col ≤640px. Gaps 1.5rem cards, 6rem two-column.
- Radii: buttons 40px, cards 20px, icon tiles 12px, badges 14–16px. Shadows soft, low-opacity.

## One-line prompt

> Build a premium wellness UI with a sage-green & cream theme. Primary `#8BAF8D` (sage), bg `#FAF7F2`
> (cream), surfaces `#FFFFFF`/`#F2ECE3`, text `#2A2A28` (charcoal), gold accent `#C9A96E`.
> 'Cormorant Garamond' (light, italic sage accents) headings + 'DM Sans' body. Pill buttons (40px),
> rounded cards (20px) soft shadows + hover-lift, uppercase letter-spaced labels, float/pulse/fade-up,
> dark charcoal sections for trust bar/testimonials/footer. Calm, editorial, luxurious, organic.
