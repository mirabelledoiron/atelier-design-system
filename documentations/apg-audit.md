# APG / Radix Pattern Audit

Scope: correctness check of the 8 hand-rolled primitives against the WAI-ARIA Authoring Practices (APG) patterns — the same patterns Radix Primitives implements. Atelier does not import Radix; this audit validates that the hand-rolled behavior matches the APG contract.

## Summary

| Component | APG pattern | Status | Severity |
|---|---|---|---|
| AtelierButton | Button | ⚠ polymorphic `as` gap | moderate — deferred |
| AtelierSwitch | Switch | ✓ conformant | minor polish — deferred |
| AtelierAccordion | Accordion / Disclosure | ✓ conformant | minor polish — deferred |
| AtelierDialog | Dialog (Modal) | ⚠ two bugs | **fixed in this branch** |
| AtelierTabs | Tabs | ⚠ no manual activation mode | moderate — deferred |
| AtelierTextField | Form labeling (non-APG) | ✓ conformant | none |
| AtelierSelect | Combobox (select-only) | ✓ conformant | none |
| AtelierCheckbox | Checkbox (tri-state) | ✓ conformant | none |

## Fixed in this branch

### AtelierDialog

**1. `triggerRef` was a plain object literal, not a React ref (latent bug).**

`src/components/AtelierDialog/AtelierDialog.tsx:61` creates `triggerRef` as `{ current: null as HTMLElement | null }` on every render. The object identity changes each render, so the reference written by the trigger's `setRef` callback is discarded each render and re-attached via the `setRef` dep list. The existing "returns focus to trigger on close" test currently passes only because `useFocusTrap` falls back to `document.activeElement` when `returnFocusTo` is `null` (`src/hooks/useFocusTrap.ts:72-73`). The bug is latent: any change to the hook's fallback, or any code path where the active element is not the trigger at open time (programmatic open from a non-trigger focus), would surface it.

**Fix:** replace the object literal with `useRef<HTMLElement | null>(null)`.

**2. `aria-labelledby` and `aria-describedby` set unconditionally.**

`AtelierDialog.tsx:191-192` always set both attributes, pointing at ids that only exist when the consumer renders `<AtelierDialog.Title>` / `<AtelierDialog.Description>`. If either is omitted, the aria reference dangles and the dialog has no accessible name or description — an APG Dialog-Modal violation.

**Fix:** track `hasTitle` / `hasDescription` in context (set via effects in Title / Description, same pattern `AtelierTextField.Description` already uses at `AtelierTextField.tsx:149-152`), and only set the aria attributes when the corresponding sub-component is mounted.

## Recommendations for follow-up branches

### AtelierButton — polymorphic `as` gap (moderate)

When `as` is neither `"button"` nor `"a"` (e.g. `<AtelierButton as="div">`), the rendered element has no `role="button"` and no Space / Enter handler. APG Button Pattern requires both. Separately, `href` / `target` / `rel` are spread onto `<button>` via `{...rest}` when `as="button"` — HTML ignores them but they leak into DOM.

**Proposed:**
- When `Component` is not `button` and not `a`: add `role="button"`, `tabIndex={disabled ? -1 : 0}`, and handle Space / Enter via `onKeyDown` to call the click handler.
- Filter `href` / `target` / `rel` out of the rest-spread when `Component === "button"`.
- Existing polymorphic test (`AtelierButton.test.tsx:17-26`) only asserts `tagName` and `href`; extend with keyboard-activation coverage for non-anchor polymorphism.

This is a behavior change for any existing consumer relying on the current `as="div"` rendering; gate behind a Changeset entry if pursued.

### AtelierTabs — missing manual activation mode (moderate)

APG Tabs defines two activation modes:
- **Automatic** (current): arrow keys move focus *and* select the tab.
- **Manual**: arrow keys move focus only; `Enter` / `Space` commits selection.

APG recommends manual when tab panels trigger heavy loads or side effects. Atelier ships automatic only.

**Proposed:** add `activationMode?: "automatic" | "manual"` on the `AtelierTabs` root. Default stays `"automatic"` so the change is non-breaking. In manual mode, `setActiveValue` is only called in the click handler and on `Enter` / `Space` keydown, not during arrow navigation.

### AtelierAccordion — heading level hard-coded to `<h3>` (minor)

`AtelierAccordion.tsx:228` wraps every trigger in a literal `<h3>`. APG says the heading element should reflect the surrounding document outline. A page whose primary heading is `<h2>` and whose accordion sits under `<h1>` has its outline broken.

**Proposed:** add `headingLevel?: 1 | 2 | 3 | 4 | 5 | 6` on `AtelierAccordion` (applies to all triggers) defaulting to `3`. Render via `React.createElement(\`h${headingLevel}\`, ...)`. Non-breaking.

### Minor polish (not APG-blocking)

- **AtelierSwitch**: hidden form input is `type="hidden"` with an empty-string value when unchecked. `type="checkbox"` with the real `checked` boolean (matching Radix Switch and matching `AtelierCheckbox`'s current hidden input) is closer to native form semantics. Current behavior is functional; the choice is stylistic.
- **AtelierTextField**: `role="alert"` on the Error element is correct for validate-on-submit patterns but can be noisy for validate-on-keystroke (screen readers announce on every re-render of the alert node). Document usage guidance in the component README rather than changing the default.
- **AtelierCheckbox**: no findings. The tri-state transition comment at `AtelierCheckbox.tsx:76-77` matches APG.
- **AtelierSelect**: no findings. The `aria-activedescendant` select-only combobox pattern is implemented per APG. Typeahead, Home / End, ArrowUp-with-selection, and Tab-to-close all present. Options register via `useLayoutEffect` at mount regardless of popup visibility, so first-keyboard-open highlights correctly.

## Methodology

Each component was read in full and cross-checked against:
- Its corresponding APG pattern (Button, Switch, Accordion / Disclosure, Dialog-Modal, Tabs, Checkbox, Combobox select-only).
- The hook behavior it depends on (`useFocusTrap`, `useControllable`, `useScrollLock`).
- The existing unit tests (to confirm which behaviors are already pinned).

Only issues visible from static code + existing tests are reported. No new test runs beyond the existing 122-test vitest-axe suite.
