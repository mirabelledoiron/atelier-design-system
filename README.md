# Atelier Primitives

A hand-rolled, zero-dependency React component library built to demonstrate senior-level design system engineering. Every primitive is built from scratch — no Radix, no Headless UI, no Tailwind. Just React, TypeScript, CSS Modules, and a Style Dictionary token pipeline.

## Why this exists

Most modern design systems wrap [Radix Primitives](https://www.radix-ui.com/) and call it a day. That's a fine *consumer* skillset. This library demonstrates the *author* skillset: building accessible behavior primitives from the WAI-ARIA Authoring Practices, with focus management, keyboard handling, and ARIA relationships hand-implemented and tested.

See [`AI.md`](./AI.md) for how AI was used vs. what was authored manually.

## What's inside

### Primitives (4 shipped)

- **AtelierButton** — polymorphic `as` prop, 6 variants, 4 sizes, loading state, icon slots
- **AtelierSwitch** — `role="switch"`, `aria-checked`, Space/Enter, controlled/uncontrolled, hidden form input
- **AtelierAccordion** — compound components via Context, single/multiple mode, ArrowUp/Down/Home/End keyboard nav, CSS grid animated height
- **AtelierDialog** — focus trap, `inert` on siblings, scroll lock, portal, Escape, overlay click, return focus

### Hooks

- `useControllable` — controlled vs uncontrolled state pattern
- `useFocusTrap` — Tab cycling, auto-focus, return focus on deactivation
- `useScrollLock` — body overflow lock with scrollbar compensation

### Foundations

- **Tokens** via Style Dictionary v4 (JSON → CSS custom properties)
- **Multi-brand**: Atelier (red/teal) and Neutral (blue/gray) via `data-brand` attribute
- **Light/dark** via `.dark` class
- **Hex colors** throughout (intentional choice over HSL — see [`DECISIONS.md`](./DECISIONS.md))

## Install

```bash
npm install atelier-primitives
```

## Usage

```tsx
import { AtelierButton, AtelierDialog } from "atelier-primitives";
import "atelier-primitives/style.css";

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
- CSS Modules (no Tailwind — see [`DECISIONS.md`](./DECISIONS.md))
- `clsx` (only non-React runtime dependency)
- Vite (dev + library build)
- Storybook 8 (component workshop)
- Vitest + Testing Library + vitest-axe (50 tests)
- Next.js 15 docs site in [`docs/`](./docs)

## Scripts

```bash
npm run tokens          # rebuild CSS variables from token JSON
npm run dev             # Storybook on :6006
npm run build           # tokens + tsc + Vite library build
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

- [`ROADMAP.md`](./ROADMAP.md) — planned primitives (TextField, Checkbox, RadioGroup, Tabs, Tooltip, Toast, Combobox)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system layers, drift prevention, multi-brand strategy
- [`DECISIONS.md`](./DECISIONS.md) — API design decisions with rationale
- [`AI.md`](./AI.md) — how AI was used, what was manual, impact

## License

MIT
