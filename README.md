<div align="center">

# @vskstudio/takt-react

**Idiomatic React wrapper for [Takt](https://github.com/uyangx/takt) privacy-friendly analytics.**

[![npm version](https://img.shields.io/npm/v/@vskstudio/takt-react?color=61dafb&logo=npm)](https://www.npmjs.com/package/@vskstudio/takt-react)
[![react 18 | 19](https://img.shields.io/badge/react-18%20%7C%2019-61dafb?logo=react&logoColor=000)](https://react.dev)
[![license](https://img.shields.io/npm/l/@vskstudio/takt-react?color=61dafb)](./LICENSE)

</div>

---

A thin, SSR-safe React layer over [`@vskstudio/takt-core`](https://www.npmjs.com/package/@vskstudio/takt-core). It never changes the wire payload or the privacy guarantees — it just makes Takt feel native in a React app.

- **`<Takt>` component** — drop it once near the root; it boots analytics in a mount effect and provides the instance to the tree.
- **`useTakt()` hook** — grab the live instance anywhere; returns a never-throwing no-op before mount or during SSR.
- **`useTaktEvent()` hook & `<TaktEvent>` component** — declarative click tracking.
- **`<takt-analytics>` custom element** — framework-agnostic, React-free embed for non-React pages.

## Install

```bash
pnpm add @vskstudio/takt-react @vskstudio/takt-core
```

`react` (`^18 || ^19`) and `@vskstudio/takt-core` are peer dependencies.

## Quick start — provider + hook

Mount `<Takt>` once near your root. It fires an initial pageview, wires SPA navigation, and provides the instance to every descendant:

```tsx
import { Takt } from '@vskstudio/takt-react'

export function App() {
  return (
    <Takt domain="example.com" outbound files={['pdf', 'zip']}>
      <Routes />
    </Takt>
  )
}
```

Then track custom events from any descendant:

```tsx
import { useTakt } from '@vskstudio/takt-react'

export function SignupButton() {
  const takt = useTakt()
  return (
    <button
      onClick={() =>
        takt.track('Signup', {
          props: { plan: 'pro' },
          revenue: { amount: '29.00', currency: 'EUR' },
        })
      }
    >
      Sign up
    </button>
  )
}
```

`useTakt()` always returns a usable instance: before `<Takt>` mounts (or during SSR) it hands back a never-throwing no-op, so your handlers never crash.

## `<Takt>` props

| Prop               | Type                  | Default              | Description                                                     |
| ------------------ | --------------------- | -------------------- | -------------------------------------------------------------- |
| `domain`           | `string`              | `location.hostname`  | Site identifier sent with every event.                         |
| `endpoint`         | `string`              | `/api/event`         | Ingestion endpoint.                                            |
| `outbound`         | `boolean`             | `false`              | Auto-track outbound link clicks.                               |
| `files`            | `boolean \| string[]` | `false`              | Auto-track file downloads; pass extensions to restrict.        |
| `spa`              | `boolean`             | `true`               | Track SPA navigations (pushState/replaceState + popstate).     |
| `respectDnt`       | `boolean`             | `true`               | Suppress events when the browser's Do Not Track is enabled.    |
| `excludeLocalhost` | `boolean`             | `true`               | Suppress events on localhost and private IP ranges.            |

## Declarative click tracking

Two equivalent ways to track a click without writing a handler.

**`useTaktEvent()`** returns an `{ onClick }` you spread onto any element:

```tsx
import { useTaktEvent } from '@vskstudio/takt-react'

export function BuyButton() {
  const onBuy = useTaktEvent({ name: 'Buy', revenue: { amount: '9.00', currency: 'EUR' } })
  return <button {...onBuy}>Buy</button>
}
```

**`<TaktEvent>`** wraps a single child and composes its existing `onClick`:

```tsx
import { TaktEvent } from '@vskstudio/takt-react'

export function SignupCta({ onClick }: { onClick: () => void }) {
  return (
    <TaktEvent name="Signup" props={{ plan: 'pro' }}>
      <button onClick={onClick}>Sign up</button>
    </TaktEvent>
  )
}
```

Both resolve the active instance at click time, so they work inside `<Takt>` or with an `init()`-driven core setup, falling back to core's default instance otherwise.

## Custom element (React-free)

For non-React pages, import the side-effecting `./element` entry to register `<takt-analytics>`. It bundles core and pulls in **no React runtime**:

```ts
import '@vskstudio/takt-react/element'
```

```html
<takt-analytics domain="example.com" outbound files></takt-analytics>
```

Privacy attributes (`respect-dnt`, `exclude-localhost`, `spa`) are on by default and only disabled by an explicit `"false"`/`"0"`. Presence flags (`outbound`, `files`) activate when the attribute is present.

## SSR / Next.js

The main entry ships with a built-in `'use client'` banner, and `<Takt>` boots inside a mount effect, so nothing touches `window`/`document` on the server. In the Next.js App Router, render `<Takt>` from a client component (or the App Router root) and the rest of the API works unchanged. Importing `@vskstudio/takt-react/element` on the server is a no-op — registration is guarded behind a `customElements` check.

## Privacy

All privacy behavior lives in [`@vskstudio/takt-core`](https://www.npmjs.com/package/@vskstudio/takt-core): Do Not Track support, localhost exclusion, opt-in/opt-out consent, and a frozen wire payload. This wrapper never alters any of it.

## License

[MIT](./LICENSE)
