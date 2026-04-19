# Atelier Primitives

A hand-rolled, minimal-dependency React component library. Every primitive is built from scratch — no Radix, no Headless UI, no Tailwind. Just React, TypeScript, CSS Modules, `clsx`, and a Style Dictionary token pipeline.

## About

I'm Mirabelle Doiron, a Design Engineer. I built Atelier Primitives to work through accessible behavior primitives directly from the WAI-ARIA Authoring Practices — focus management, keyboard handling, and ARIA relationships, hand-implemented and tested.

See [`ai.md`](./documentations/ai.md) for how I used AI versus what I wrote by hand.

## What's inside

### Primitives (8 shipped)

- **AtelierButton** — polymorphic `as` prop, 6 variants, 4 sizes, loading state, icon slots
- **AtelierSwitch** — `role="switch"`, `aria-checked`, Space/Enter, controlled/uncontrolled, hidden form input
- **AtelierAccordion** — compound components via Context, single/multiple mode, ArrowUp/Down/Home/End keyboard nav, CSS grid animated height
- **AtelierDialog** — focus trap, `inert` on siblings, scroll lock, portal, Escape, overlay click, return focus
- **AtelierTabs** — compound components, roving tabindex, horizontal/vertical orientation, controlled/uncontrolled, Arrow/Home/End keyboard nav
- **AtelierTextField** — compound Label/Input/Description/Error, `aria-describedby` + `aria-invalid` + `aria-errormessage` wiring, 3 sizes
- **AtelierSelect** — listbox pattern via portal, typeahead, highlighted index, Arrow/Home/End/Esc keyboard nav, controlled/uncontrolled
- **AtelierCheckbox** — tri-state (`aria-checked="mixed"`), controlled/uncontrolled, hidden native input for form submission

### Hooks

- `useControllable` — controlled vs uncontrolled state pattern
- `useFocusTrap` — Tab cycling, auto-focus, return focus on deactivation
- `useScrollLock` — body overflow lock with scrollbar compensation

### Foundations

- **Tokens** via Style Dictionary v4 (JSON → CSS custom properties)
- **Multi-brand**: Atelier (red/teal) and Neutral (blue/gray) via `data-brand` attribute
- **Light/dark** via `.dark` class
- **Hex colors** throughout (intentional choice over HSL — see [`decisions.md`](./documentations/decisions.md))

## Install

> Not yet published to npm. Clone the repo and run `npm install` locally. The published API below is what the package will expose once `"private": true` is flipped in `package.json`.

```bash
npm install atelier-design-system
```

## Usage

```tsx
import { AtelierButton, AtelierDialog } from "atelier-design-system";
import "atelier-design-system/style.css";

export function Example() {
  return (
    <AtelierDialog>
      <AtelierDialog.Trigger asChild>
        <AtelierButton variant="primary">Open</AtelierButton>
      </AtelierDialog.Trigger>
      <AtelierDialog.Content>
        <AtelierDialog.Title>Confirm action</AtelierDialog.Title>
        <AtelierDialog.Description>This cannot be undone.</AtelierDialog.Description>
      </AtelierDialog.Content>
    </AtelierDialog>
  );
}
```

Set the brand and theme on a wrapping element:

```tsx
<div data-brand="atelier" className="dark">
  {/* components inherit brand + theme */}
</div>
```

## Stack

- React 18 + TypeScript
- Style Dictionary v4 (token pipeline)
- CSS Modules (no Tailwind — see [`decisions.md`](./documentations/decisions.md))
- `clsx` (className composition)
- Vite (library build)
- Storybook 8 (component workshop)
- Vitest + Testing Library + vitest-axe (122 tests)
- Next.js 15 docs site in [`app/`](./app)

## Scripts

```bash
npm run tokens          # rebuild CSS variables from token JSON
npm run dev             # Next.js docs site on :3000
npm run dev:storybook   # Storybook on :6006
npm run build           # tokens + Next.js docs site build
npm run build:lib       # tokens + tsc + Vite library build
npm run build-storybook # static Storybook for hosting
npm run test            # Vitest with vitest-axe
npm run lint            # ESLint
```

## Accessibility

Every primitive ships with:

- Keyboard operability per WAI-ARIA Authoring Practices
- Visible focus states meeting WCAG 2.1 AA contrast (≥3:1 for non-text UI)
- Correct ARIA roles, states, and relationships
- vitest-axe assertions in unit tests
- Storybook a11y addon for manual verification

## Documentation

- [`roadmap.md`](./documentations/roadmap.md) — planned primitives (RadioGroup, Tooltip, Toast, Combobox)
- [`architecture.md`](./documentations/architecture.md) — system layers, drift prevention, multi-brand strategy
- [`decisions.md`](./documentations/decisions.md) — API design decisions with rationale
- [`ai.md`](./documentations/ai.md) — how AI was used, what was manual, impact

## License

MIT
