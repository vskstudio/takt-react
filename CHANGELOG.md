# @vskstudio/takt-react

## 0.1.0

### Minor Changes

- Initial release: idiomatic React wrapper for Takt analytics.

  - `<Takt>` provider component (SSR-safe boot in `useEffect`, `'use client'`)
  - `useTakt()` hook with a never-throwing no-op fallback
  - `useTaktEvent()` hook and `<TaktEvent>` component for declarative click tracking
  - React-free `<takt-analytics>` custom element via `./element`
