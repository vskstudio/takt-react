# @vskstudio/takt-react

## 0.3.1

### Patch Changes

- Harden widgets: render `src` after `{...rest}` so a consumer-passed `src` can no longer override the built URL, and add a default `referrerPolicy="strict-origin-when-cross-origin"` to `<TaktEmbed>` (overridable). Document that `host` must be an absolute http(s) URL.

## 0.3.0

### Minor Changes

- Add native `TaktBadge` and `TaktEmbed` widget components and re-export the public stats client (`createStats`) and widget URL builders from `@vskstudio/takt-core`. Requires `@vskstudio/takt-core` >= 0.3.0.

## 0.2.0

### Minor Changes

- Align with `@vskstudio/takt-core` 0.2 (peer dependency bumped to `>=0.2.0`):
  custom event `props` and `revenue` now flow through `useTakt()`, `useTaktEvent()`
  and `<TaktEvent>`.
  - Ref-forwarding `<TaktEvent>` and StrictMode-correct `<Takt>` boot.
  - Fully typed no-op fallback and structural `TaktInstance` declaration emit.
  - SSR import safety hardened (lazy element class for Node).

## 0.1.0

### Minor Changes

- Initial release: idiomatic React wrapper for Takt analytics.

  - `<Takt>` provider component (SSR-safe boot in `useEffect`, `'use client'`)
  - `useTakt()` hook with a never-throwing no-op fallback
  - `useTaktEvent()` hook and `<TaktEvent>` component for declarative click tracking
  - React-free `<takt-analytics>` custom element via `./element`
