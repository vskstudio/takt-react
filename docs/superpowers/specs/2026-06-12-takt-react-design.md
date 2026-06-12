# @vskstudio/takt-react — Design

**Goal:** An idiomatic React wrapper for `@vskstudio/takt-core`, mirroring the contract of the sibling `@vskstudio/takt-vue` and `@vskstudio/takt-svelte` packages.

**Principle:** Thin layer. The core owns all network, payload, sanitization, and privacy. The wrapper only makes Takt feel native in React — it never changes the wire payload or the privacy guarantees.

## Public API

Two entry points, declared in the `exports` map.

### `.` — main entry (`'use client'`)

- **`<Takt>`** — provider component. Boots analytics after mount and provides the instance to the tree.
  - Props (same names/defaults as takt-vue): `domain?`, `endpoint?`, `outbound?: boolean = false`, `files?: boolean | string[] = false`, `spa?: boolean = true`, `respectDnt?: boolean = true`, `excludeLocalhost?: boolean = true`.
  - Renders `{children}`.
- **`useTakt(): TaktInstance`** — returns the live instance, or a never-throwing no-op before mount / during SSR.
- **`useTaktEvent(params): { onClick: () => void }`** — declarative click tracking; spread the result onto any element. Resolves the instance at click time (no stale closure), falls back to core `track`.
- **`<TaktEvent name props? revenue?>`** — wraps a single child via `cloneElement`, composing any existing `onClick`. Uses `useTaktEvent` internally.
- Re-exported type: `TaktInstance`, `TaktEventParams`, and core's `Config`.

### `./element` — framework-agnostic custom element

- Registers `<takt-analytics>` as an import side effect.
- **React-free**: a minimal `class extends HTMLElement` that parses attributes and calls `createTakt` directly. No React runtime is bundled (the element renders no UI), so the bundle stays a few kB — smaller than the Vue/Svelte element builds.
- Privacy attributes (`spa`, `respect-dnt`, `exclude-localhost`) are presence-default-on: only `"false"`/`"0"` disable them. `outbound`/`files` are presence flags.
- Exports `defineTaktElement()` for explicit, idempotent, SSR-safe registration.

## File structure

One responsibility per file (mirrors siblings):

- `src/store.ts` — `TaktContext` (React Context) + module-level fallback store (`let _instance`). `resolveTakt()` returns context value ?? module store ?? null. `useTakt` composes with `noop`.
- `src/Takt.tsx` — `'use client'` provider. `useEffect` mount: `createTakt` → enable `spa`/`outbound`/`files` (push disposers) → `pageview` → publish instance to context + module store. Cleanup disposers and null the stores on unmount.
- `src/useTakt.ts` — `useTakt()` → `resolveTakt() ?? noopTakt()`.
- `src/useTaktEvent.ts` — `useTaktEvent({ name, props, revenue })` → memoized `{ onClick }`. At click time: resolve instance, build `opts` from `props`/`revenue`, `instance.track(...)` or core `track(...)` fallback.
- `src/TaktEvent.tsx` — `<TaktEvent>` wrapping a single child via `cloneElement`, composing the child's existing `onClick` with the tracking handler.
- `src/noop.ts` — never-throwing stand-in, warns once.
- `src/element/TaktAnalyticsElement.ts` — the `HTMLElement` subclass + attribute parsing + `truthy()` helper (only `"false"`/`"0"` disable).
- `src/element/index.ts` — `defineTaktElement()` (idempotent, SSR-guarded) + side-effect registration on import.
- `src/index.ts` — barrel for the `.` entry.

## Data flow

`<Takt>` (or the plugin-less app) creates the instance and publishes it two ways: React Context (for the subtree) and a module-level store (for `useTaktEvent` handlers and any out-of-tree caller). Hooks resolve context first, module store second, no-op last. The directive-equivalent (`useTaktEvent`/`<TaktEvent>`) reads the instance at click time so it always tracks through the current instance, with a core-`track` fallback for users who drive core's `init()` directly.

## SSR / RSC safety

- All browser work is deferred to `useEffect` / `customElements` guards. Every entry is import-safe under Node.
- `'use client'` is preserved on the `.` entry (injected as a tsup banner) so the Next.js App Router accepts the provider/hooks without an RSC error.
- `useTakt()` returns the no-op during the server pass; the element only registers when `customElements` exists.

## Build

- **tsup**, two entries:
  - `.` — externalizes `react`, `react/jsx-runtime`, and `@vskstudio/takt-core`; emits ESM + `.d.ts`; `banner: { js: "'use client'" }`.
  - `./element` — self-contained (core bundled) for CDN `<script>` use; ESM + `.d.ts`.
- `package.json`: pro metadata from day one (`author: "VSK Studio"`, `engines.node: ">=18"`, top-level `types`, `unpkg`/`jsdelivr` → element bundle, `publishConfig.access: public`, `sideEffects: ["./dist/element/index.js"]`).
- Peer deps: `@vskstudio/takt-core >=0.2.0`, `react ^18 || ^19`.

## Testing

vitest + `@testing-library/react` + jsdom (and one Node-environment file for SSR). Target ~30 tests:

- `<Takt>` boots on mount, disposes on unmount, honors feature toggles.
- `useTakt()` no-op before mount / outside provider.
- `useTaktEvent()` routes through the provided instance; falls back to core `track`; reads fresh params (no stale closure); builds `opts` only when `props`/`revenue` present.
- `<TaktEvent>` injects `onClick` and composes the child's existing `onClick`.
- Element: idempotent registration, attribute → boolean parsing, privacy default-on.
- SSR: every entry imports under Node with no `window`/`document`/`customElements`.

## CI / repo

- Hardened workflow mirrored from siblings: SHA-pinned actions, `permissions: contents: read`, `concurrency` cancel, `timeout-minutes`, `persist-credentials: false`, npm provenance (`id-token: write` + `NPM_CONFIG_PROVENANCE`).
- Matrix `react: [18, 19]`.
- New **public** GitHub repo `vskstudio/takt-react`.
- Branch protection on `main` matching the siblings (required `build` checks, 1 review, no force-push/deletions) — applied after the first green CI.

## Out of scope (YAGNI)

- No React-runtime-based custom element (the React-free element covers the embed use case at a fraction of the size).
- No `TaktPlugin`-style global install (React has no plugin concept; the provider is the install path).
- No changes to core.
