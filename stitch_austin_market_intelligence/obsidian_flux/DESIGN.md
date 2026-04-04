# Design System Documentation: High-End Real Estate Analytics

## 1. Overview & Creative North Star: "The Obsidian Lens"
The North Star for this design system is **"The Obsidian Lens."** In the world of high-stakes real estate analytics, clarity is secondary only to precision. We are moving away from the "SaaS-in-a-box" look. Instead, we treat the interface as a sophisticated optical instrument—an expansive, dark environment where data doesn't just sit on a screen, but glows with intelligence.

By utilizing **intentional asymmetry** and **tonal depth**, we break the rigid grid. We favor overlapping elements and glassmorphic layers that suggest a 3D workspace. This is not a flat dashboard; it is a high-performance cockpit for digital property curation.

---

## 2. Colors: Tonal Depth & Luminous Accents
Our palette is rooted in deep, midnight foundations, punctuated by electric, high-frequency accents.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Boundaries must be established through background shifts. For instance, a `surface-container-low` component should sit on a `surface` background to create a "soft edge" definition.

### Surface Hierarchy & Nesting
Depth is achieved through the physical stacking of tiers. 
- **Base Layer:** `surface` (#060e20)
- **Primary Layout Blocks:** `surface-container-low` (#091328)
- **Interactive Widgets:** `surface-container-high` (#141f38)
- **Active/Hover States:** `surface-container-highest` (#192540)

### The "Glass & Gradient" Rule
To achieve the "Obsidian Lens" effect, floating panels (like map controls) must use **Glassmorphism**:
- **Fill:** `secondary-container` at 40% opacity.
- **Backdrop Blur:** 12px to 20px.
- **Signature Glow:** Use a linear gradient transition from `primary` (#81ecff) to `primary-container` (#00e3fd) for main CTAs to provide "soul" and a sense of high-performance energy.

---

## 3. Typography: Editorial Authority
We use a tri-font system to balance technical precision with high-end editorial flair.

*   **Display & Headlines (Plus Jakarta Sans):** Chosen for its modern, geometric character. Use `display-lg` for hero metrics to give them an authoritative, "architectural" weight.
*   **Titles & Body (Manrope):** A highly functional sans-serif that maintains legibility in dense data environments. Use `title-md` for card headings to ensure a sophisticated professional tone.
*   **Data Labels (Inter):** Reserved for small-scale utility. Its neutral stance ensures that complex map coordinates and micro-labels remain hyper-readable without visual fatigue.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We use **Ambient Luminous Shadows**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a natural "cut-out" effect.
*   **Ambient Shadows:** For floating elements, use a diffused 24px blur with 6% opacity. The shadow color should be a tint of `primary-dim` rather than black, mimicking the glow of a high-tech display.
*   **The Ghost Border:** If containment is required for accessibility, use the `outline-variant` (#40485d) at **15% opacity**. This provides a "hint" of a boundary without breaking the seamless glass aesthetic.

---

## 5. Components

### Sidebar (Map Controls)
*   **Style:** `surface-container-low` background. No border.
*   **Layout:** Use asymmetrical spacing. Group controls in "floating clusters" rather than a continuous list.
*   **Interaction:** Active states use a `primary` glow strip (2px wide) on the far left.

### Metric Cards
*   **Rule:** Forbid the use of divider lines.
*   **Structure:** Use vertical white space (1.5rem) to separate the `display-sm` metric from the `body-sm` trend description.
*   **Background:** Use a subtle gradient from `surface-container-high` to `surface-container-low`.

### Data Visualization Containers
*   **Aesthetic:** "Data as Light." Charts should utilize `primary`, `secondary`, and `tertiary` tokens.
*   **Grid Lines:** Use `outline-variant` at 10% opacity. Data points should feel like they are floating in deep space.

### Buttons
*   **Primary:** Solid `primary` background with `on-primary` text. No border. Radius: `md` (0.375rem).
*   **Secondary (Glass):** Semi-transparent `surface-variant` with a `backdrop-filter: blur(8px)`.
*   **Tertiary:** Transparent background, `primary` text. Use for low-emphasis actions like "View Details."

### Input Fields
*   **State:** Default state is `surface-container-highest`.
*   **Focus:** A 1px "Ghost Border" using `primary` at 50% opacity and a subtle outer glow of `primary_dim`.

---

## 6. Do’s and Don'ts

### Do
*   **Do** use asymmetrical margins to create an editorial, "bespoke" feel.
*   **Do** rely on typography scale (e.g., jumping from `label-sm` to `display-md`) to create hierarchy.
*   **Do** use `primary-fixed-dim` for inactive but important data points to maintain a sophisticated "dimmed" look.

### Don't
*   **Don't** use pure white (#FFFFFF) for text. Always use `on-surface` (#dee5ff) to reduce eye strain in dark mode.
*   **Don't** use 100% opaque borders. They create "visual noise" and make the platform look like a generic template.
*   **Don't** use standard shadows. If an element doesn't feel elevated through color alone, use a "Ghost Border" or an ambient glow.