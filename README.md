<div align="center">

# @vskstudio/takt-react


> 📚 **Documentation** — [taktlytics.com/docs/wrappers/react](https://taktlytics.com/docs/wrappers/react)

**Idiomatic React wrapper for [Takt](https://github.com/vskstudio/takt-core) privacy-friendly analytics.**

[![npm version](https://img.shields.io/npm/v/@vskstudio/takt-react?color=61dafb&logo=npm)](https://www.npmjs.com/package/@vskstudio/takt-react)
[![react 18 | 19](https://img.shields.io/badge/react-18%20%7C%2019-61dafb?logo=react&logoColor=000)](https://react.dev)
[![license](https://img.shields.io/npm/l/@vskstudio/takt-react?color=61dafb)](./LICENSE)

</div>

---

A thin, SSR-safe React layer over [`@vskstudio/takt-core`](https://www.npmjs.com/package/@vskstudio/takt-core). It never changes the wire payload or the privacy guarantees — it just makes Takt feel native in a React app.

- **`<Takt>` component** — drop it once near the root; it boots analytics in a mount effect and provides the instance to the tree.
- **`useTakt()` hook** — grab the live instance anywhere; returns a never-throwing no-op before mount or during SSR (it warns once in the console rather than failing silently).
- **`useTaktEvent()` hook & `<TaktEvent>` component** — declarative click tracking.
- **`<takt-analytics>` custom element** — framework-agnostic, React-free embed for non-React pages.

## Install

```bash
pnpm add @vskstudio/takt-react @vskstudio/takt-core
```

Both are peer dependencies: `react` (`^18 || ^19`) and `@vskstudio/takt-core` (`>=0.8.1`).

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

`useTakt()` always returns a usable instance: before `<Takt>` mounts (or during SSR) it hands back a never-throwing no-op, so your handlers never crash. That no-op is not silent — the first `track()`/`pageview()` call on it logs a single `console.warn` so a mis-ordered provider does not go unnoticed.

## `<Takt>` props

| Prop               | Type                      | Default              | Description                                                     |
| ------------------ | ------------------------- | -------------------- | -------------------------------------------------------------- |
| `domain`           | `string`                  | `location.hostname`  | Site identifier sent with every event.                         |
| `endpoint`         | `string`                  | `https://taktlytics.com/api/event` | Ingestion endpoint. Pass `/api/event` for a same-origin first-party proxy. |
| `scriptOrigin`     | `string`                  | —                    | First-party origin to derive the endpoint from (`{origin}/api/event`) — your Takt domain or a custom domain to dodge ad-blockers (`endpoint` wins over it). |
| `outbound`         | `boolean`                 | `false`              | Auto-track outbound link clicks.                               |
| `files`            | `boolean \| string[]`     | `false`              | Auto-track file downloads; pass extensions to restrict.        |
| `spa`              | `boolean`                 | `true`               | Track SPA navigations (pushState/replaceState + popstate).     |
| `track404`         | `boolean`                 | `false`              | Report a `404` event on error pages (`[data-takt-404]` / `<meta name="takt:404">` marker, or a 404 HTTP status). |
| `respectDnt`       | `boolean`                 | `true`               | Suppress events when the browser's Do Not Track is enabled.    |
| `excludeLocalhost` | `boolean`                 | `true`               | Suppress events on localhost and private IP ranges.            |
| `enabled`          | `boolean`                 | `true`               | Master on/off switch — set to `false` to disable all tracking at runtime. |
| `sampleRate`       | `number`                  | `1`                  | Fraction of sessions to track (0–1).                           |
| `trackQuery`       | `boolean`                 | `false`              | Keep the full query string and hash on URLs. Wins over `queryParams`. |
| `queryParams`      | `string[]`                | —                    | Allowlist applied when `trackQuery` is off: keep only these query params, drop the rest. |
| `exclude`          | `string[]`                | —                    | Path prefixes never tracked, e.g. `['/app', '/account']` (segment-bounded, checked at send time). |
| `scrubUrl`         | `(url: string) => string` | —                    | Transform the URL before it is sent. **Component prop only** — cannot be set as a custom-element attribute. Must be a developer-controlled function; never build it from user input. |
| `tagged`           | `boolean`                 | `false`              | Auto-track clicks on `[data-takt-event]` elements; `data-takt-prop-*` attributes become event props. |

> Config props are read once when `<Takt>` mounts. Changing them afterwards has no effect — remount the component to reconfigure.

`<Takt>` also unwires everything it enabled on unmount (SPA, outbound, files, 404, tagged), and de-duplicates the initial pageview across React StrictMode's double mount.

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

Both take core's `TrackOptions` (`props`, `revenue`) plus a `name`, and resolve the active instance at click time, so they work inside `<Takt>` or with an `init()`-driven core setup, falling back to core's default instance otherwise.

`<TaktEvent>` expects exactly one React element child: it forwards its own `ref` onto that child (composing with any ref the child already carries), and in development it warns and renders the children untouched if the child is not a valid element.

## Custom element (React-free)

For non-React pages, import the side-effecting `./element` entry to register `<takt-analytics>`. It bundles core and pulls in **no React runtime**:

```ts
import '@vskstudio/takt-react/element'
```

```html
<takt-analytics domain="example.com" outbound files></takt-analytics>
```

| Attribute           | Kind     | Maps to            | Notes                                                          |
| ------------------- | -------- | ------------------ | -------------------------------------------------------------- |
| `domain`            | value    | `domain`           | Defaults to `location.hostname`.                                |
| `endpoint`          | value    | `endpoint`         | Defaults to `https://taktlytics.com/api/event`.                 |
| `script-origin`     | value    | `scriptOrigin`     | `endpoint` wins over it.                                        |
| `sample-rate`       | value    | `sampleRate`       | Parsed as a float; ignored if not finite.                       |
| `query-params`      | value    | `queryParams`      | Comma-separated list, e.g. `query-params="utm_source,ref"`.     |
| `exclude`           | value    | `exclude`          | Comma-separated list of path prefixes.                          |
| `respect-dnt`       | boolean  | `respectDnt`       | On by default; only `"false"`/`"0"` disables it.                |
| `exclude-localhost` | boolean  | `excludeLocalhost` | On by default; only `"false"`/`"0"` disables it.                |
| `spa`               | boolean  | `spa`              | On by default; only `"false"`/`"0"` disables it.                |
| `enabled`           | boolean  | `enabled`          | Only read when the attribute is present; `"false"`/`"0"` disables tracking. |
| `track-query`       | boolean  | `trackQuery`       | Only read when the attribute is present.                        |
| `outbound`          | presence | `outbound`         | Active as soon as the attribute exists.                         |
| `files`             | presence | `files`            | Active as soon as the attribute exists; extensions cannot be restricted from an attribute. |
| `tagged`            | presence | `tagged`           | Autocapture of `[data-takt-event]` clicks.                      |

The element fires a pageview on `connectedCallback` and disposes every listener it added on `disconnectedCallback`. Two `<Takt>` props have no attribute equivalent: `scrubUrl` (a function) and `track404`.

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

`<TaktBadge>` takes `domain` (required), `variant` (`a` | `b` | `d`), `glyph` (`unplug` | `dash` | `off` | `eyeoff`), `lang` (`fr` | `en`) and `host`. `<TaktEmbed>` takes `domain` (required), `theme` (`light` | `dark` | `auto`), `lang` and `host`.

The badge `alt` defaults to `"takt"` and ships `loading="lazy" decoding="async"`; the embed defaults to `width={404} height={264} title="takt" loading="lazy"` and a zero border. All of those are overridable. The embed `<iframe>` is hardened: it ships `sandbox="allow-scripts allow-same-origin"` and a fixed `referrerPolicy="strict-origin-when-cross-origin"`, both applied after your props so a consumer cannot weaken them. The optional `host` prop must be an absolute `http(s)` URL (validated by core, which reduces it to its origin); `src` is wrapper-controlled and cannot be overridden.

For dashboards you build yourself, `createStats` is re-exported from core. Every method takes the domain first, then the params — the domain is optional once `createStats` is bound to one:

```ts
import { createStats, PublicApiError } from '@vskstudio/takt-react'

const stats = createStats({ domain: 'example.com' })

try {
  const summary = await stats.summary(undefined, { period: '7d' })
  const rows = await stats.breakdown('page', undefined, { period: '7d' })
  const live = await stats.realtime()
} catch (err) {
  if (err instanceof PublicApiError) console.error(err.status, err.message)
}
```

## Public exports

From the main entry:

- Components: `Takt`, `TaktEvent`, `TaktBadge`, `TaktEmbed`
- Hooks: `useTakt`, `useTaktEvent`
- Re-exported from core: `badgeUrl`, `embedUrl`, `createStats`, `PublicApiError`
- Types: `TaktProps`, `TaktEventParams`, `TaktBadgeProps`, `TaktEmbedProps`, `TaktInstance`, plus `Config`, `BadgeOptions`, `EmbedOptions`, `BadgeVariant`, `BadgeGlyph`, `EmbedTheme`, `WidgetLang`, `StatsClient`, `StatsClientOptions`, `StatsParams`, `StatsPeriod`, `StatsDimension`, `StatsMetrics`, `StatsSummary`, `StatsPoint`, `StatsTimeseries`, `StatsBreakdownRow`, `StatsBreakdown`, `StatsRealtime` re-exported from core

From `@vskstudio/takt-react/element`: `defineTaktElement()`. Importing the subpath already calls it — the named export is there for explicit or repeated registration (it is idempotent).

## SSR / Next.js

The main entry ships with a built-in `'use client'` banner, and `<Takt>` boots inside a mount effect, so nothing touches `window`/`document` on the server. In the Next.js App Router, render `<Takt>` from a client component (or the App Router root) and the rest of the API works unchanged. Importing `@vskstudio/takt-react/element` on the server is a no-op — registration is guarded behind a `customElements` check.

## Privacy

All privacy behavior lives in [`@vskstudio/takt-core`](https://www.npmjs.com/package/@vskstudio/takt-core): Do Not Track support, localhost exclusion, opt-in/opt-out consent, and a frozen wire payload. This wrapper never alters any of it.

## License

[MIT](./LICENSE)
