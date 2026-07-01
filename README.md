<div align="center">

# @vskstudio/takt-react

**Idiomatic React wrapper for [Takt](https://github.com/vskstudio/takt-core) privacy-friendly analytics.**

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

| Prop               | Type                      | Default              | Description                                                     |
| ------------------ | ------------------------- | -------------------- | -------------------------------------------------------------- |
| `domain`           | `string`                  | `location.hostname`  | Site identifier sent with every event.                         |
| `endpoint`         | `string`                  | `/api/event`         | Ingestion endpoint.                                            |
| `scriptOrigin`     | `string`                  | —                    | First-party origin to derive the endpoint from (`{origin}/api/event`) — your Takt domain or a custom domain to dodge ad-blockers (`endpoint` wins over it). |
| `outbound`         | `boolean`                 | `false`              | Auto-track outbound link clicks.                               |
| `files`            | `boolean \| string[]`     | `false`              | Auto-track file downloads; pass extensions to restrict.        |
| `spa`              | `boolean`                 | `true`               | Track SPA navigations (pushState/replaceState + popstate).     |
| `track404`         | `boolean`                 | `false`              | Report a `404` event on error pages (`[data-takt-404]` / `<meta name="takt:404">` marker, or a 404 HTTP status). |
| `respectDnt`       | `boolean`                 | `true`               | Suppress events when the browser's Do Not Track is enabled.    |
| `excludeLocalhost` | `boolean`                 | `true`               | Suppress events on localhost and private IP ranges.            |
| `enabled`          | `boolean`                 | `true`               | Master on/off switch — set to `false` to disable all tracking at runtime. |
| `sampleRate`       | `number`                  | `1`                  | Fraction of sessions to track (0–1).                           |
| `trackQuery`       | `boolean`                 | `false`              | Include the URL query string in pageview paths.                |
| `queryParams`      | `string[]`                | —                    | Query parameters to preserve when `trackQuery` is true; omit to keep all. |
| `exclude`          | `string[]`                | —                    | Path prefixes never tracked, e.g. `['/app', '/account']` (segment-bounded, checked at send time). |
| `scrubUrl`         | `(url: string) => string` | —                    | Transform the URL before it is sent. **Component prop only** — cannot be set as a custom-element attribute. Must be a developer-controlled function; never build it from user input. |
| `tagged`           | `boolean`                 | `false`              | Auto-track `[data-takt-tag]` clicks.                           |

> Config props are read once when `<Takt>` mounts. Changing them afterwards has no effect — remount the component to reconfigure.

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

## Widgets

Thin wrappers over Takt's server-rendered widgets. `<TaktBadge>` renders an `<img>` (the badge SVG); `<TaktEmbed>` renders an `<iframe>` (the embed dashboard). Both forward standard element attributes (`className`, `style`, …).

```tsx
import { TaktBadge, TaktEmbed } from '@vskstudio/takt-react'

export function Footer() {
  return (
    <>
      <TaktBadge domain="example.com" variant="d" glyph="dash" />
      <TaktEmbed domain="example.com" theme="dark" />
    </>
  )
}
```

The badge `alt` defaults to `"takt"` but is overridable. The embed `<iframe>` is hardened: it ships `sandbox="allow-scripts allow-same-origin"` and a fixed `referrerPolicy="strict-origin-when-cross-origin"`, both applied after your props so a consumer cannot weaken them. The optional `host` prop must be an absolute `http(s)` URL (validated by core, which reduces it to its origin); `src` is wrapper-controlled and cannot be overridden.

For dashboards you build yourself, `createStats` is re-exported from core:

```ts
import { createStats } from '@vskstudio/takt-react'

const stats = createStats({ domain: 'example.com' })
const summary = await stats.summary({ period: '7d' })
```

## SSR / Next.js

The main entry ships with a built-in `'use client'` banner, and `<Takt>` boots inside a mount effect, so nothing touches `window`/`document` on the server. In the Next.js App Router, render `<Takt>` from a client component (or the App Router root) and the rest of the API works unchanged. Importing `@vskstudio/takt-react/element` on the server is a no-op — registration is guarded behind a `customElements` check.

## Privacy

All privacy behavior lives in [`@vskstudio/takt-core`](https://www.npmjs.com/package/@vskstudio/takt-core): Do Not Track support, localhost exclusion, opt-in/opt-out consent, and a frozen wire payload. This wrapper never alters any of it.

## License

[MIT](./LICENSE)
