# Design System Reference
*Extracted from nzmalaya.com — for reuse as a style reference on other projects*

---

## 1. Color Palette

### Brand / Primary Colors
| Name | Hex | Usage |
|---|---|---|
| Primary Brand | `#163C5B` | Buttons, hover states, primary brand color (deep navy) |
| Royal Blue | `#1546A0` | Accent / secondary brand color |
| Bright Blue | `#266AE7` | Accent / links |
| White | `#FFFFFF` | Base background, button text on dark backgrounds |

### Neutral / Gray Scale
| Name | Hex |
|---|---|
| Grey 50 | `#F9FAFB` |
| Grey 100 | `#F3F4F6` |
| Grey 200 | `#E5E7EB` |
| Grey 300 | `#D1D5DB` |
| Grey 400 | `#9CA3AF` |
| Grey 450 | `#787E8B` |
| Grey 500 | `#6B7280` |
| Grey 600 | `#4B5563` |
| Grey 700 | `#374151` *(body text color)* |
| Grey 800 | `#1F2937` |
| Grey 900 | `#111827` *(heading color)* |

### Utility / Status Colors
| Name | Hex | Typical Use |
|---|---|---|
| Blue 500 | `#3B82F6` | Info |
| Blue 600 | `#2563EB` | Info (darker) |
| Pink 600 | `#DB2777` | Accent |
| Emerald 100 | `#D1FAE5` | Success (bg) |
| Emerald 700 | `#047857` | Success (text) |
| Sky 100 | `#E0F2FE` | Info (bg) |
| Sky 500 | `#0EA5E9` | Info |
| Red 50 | `#FEF2F2` | Error (bg) |
| Red 500 | `#EF4444` | Error |
| Red 700 | `#B91C1C` | Error (dark) |
| Indigo 50 | `#EEF2FF` | Accent (bg) |
| Indigo 600 | `#4F46E5` | Accent |
| Indigo 700 | `#4338CA` | Accent (dark) |
| Yellow 500 | `#FBBF24` | Warning |

**Overall palette impression:** navy blue + white + neutral gray — a trustworthy, corporate/professional feel (common for travel & service businesses), not a bright or playful palette.

---

## 2. Typography

- **Font family (body + headings):** `"Poppins", sans-serif` (Google Font)
- **Base font size:** `16px`
- **Type scale ratio:** `1.25` (each heading level up multiplies the previous by 1.25 — a modular scale)

| Level | Formula | Approx. Size |
|---|---|---|
| Body / H6 | base | 16px |
| H5 | base × 1.25 | 20px |
| H4 | H5 × 1.25 | 25px |
| H3 | H4 × 1.25 | 31.25px |
| H2 | H3 × 1.25 | 39px |
| H1 | H2 × 1.25 | 48.8px |

**Observed heading weights:** Bold, `font-weight: 600` (seen on several heading presets at 39.81px, 27.65px, 23.04px, 19.2px).

**Body text color:** `#374151` (Grey 700)
**Heading color:** `#111827` (Grey 900)

---

## 3. Layout & Spacing

- **Max content width:** `1120px`
- **Section vertical padding:** `100px`
- **Section horizontal padding:** `20px`
- **Column gap:** `32px`
- **Scroll behavior:** `smooth` (site-wide)
- **Transition duration (default):** `300ms`

### Spacing scale (rem-based, WordPress preset)
| Token | Value |
|---|---|
| spacing-20 | 0.44rem |
| spacing-30 | 0.67rem |
| spacing-40 | 1rem |
| spacing-50 | 1.5rem |
| spacing-60 | 2.25rem |
| spacing-70 | 3.38rem |
| spacing-80 | 5.06rem |

---

## 4. Shadows

| Name | Value |
|---|---|
| Natural | `6px 6px 9px rgba(0,0,0,0.2)` |
| Deep | `12px 12px 50px rgba(0,0,0,0.4)` |
| Sharp | `6px 6px 0px rgba(0,0,0,0.2)` |
| Outlined | `6px 6px 0px -3px #fff, 6px 6px #000` |
| Crisp | `6px 6px 0px #000` |

---

## 5. Tech Stack Notes

- Built on **WordPress**, using the **Breakdance** page builder (variable prefixes `--bde-*` and `--wp--preset--*`).
- Standard WordPress Gutenberg color/gradient/spacing presets are present but largely act as defaults rather than the active brand system.

---

## 6. Ready-to-use CSS Variables

```css
:root {
  /* Brand colors */
  --brand-primary: #163C5B;
  --brand-secondary: #1546A0;
  --brand-accent: #266AE7;
  --white: #FFFFFF;

  /* Neutrals */
  --grey-50: #F9FAFB;
  --grey-100: #F3F4F6;
  --grey-200: #E5E7EB;
  --grey-300: #D1D5DB;
  --grey-400: #9CA3AF;
  --grey-500: #6B7280;
  --grey-600: #4B5563;
  --grey-700: #374151;
  --grey-800: #1F2937;
  --grey-900: #111827;

  /* Typography */
  --font-family-base: "Poppins", sans-serif;
  --font-size-base: 16px;
  --font-scale-ratio: 1.25;
  --heading-color: var(--grey-900);
  --body-text-color: var(--grey-700);

  /* Layout */
  --section-max-width: 1120px;
  --section-padding-vertical: 100px;
  --section-padding-horizontal: 20px;
  --column-gap: 32px;

  /* Motion */
  --transition-duration: 300ms;

  /* Shadows */
  --shadow-natural: 6px 6px 9px rgba(0,0,0,0.2);
  --shadow-deep: 12px 12px 50px rgba(0,0,0,0.4);
  --shadow-sharp: 6px 6px 0px rgba(0,0,0,0.2);
  --shadow-crisp: 6px 6px 0px #000;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  color: var(--body-text-color);
  scroll-behavior: smooth;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-base);
  color: var(--heading-color);
  font-weight: 600;
}

.button-primary {
  background-color: var(--brand-primary);
  color: var(--white);
  transition: background-color var(--transition-duration) ease;
}
.button-primary:hover {
  background-color: var(--brand-secondary);
}
```
