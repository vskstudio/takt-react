# @vskstudio/takt-react Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@vskstudio/takt-react`, a thin idiomatic React 18/19 wrapper over `@vskstudio/takt-core`, mirroring the sibling `takt-vue`/`takt-svelte` packages.

**Architecture:** A React Context plus a module-level fallback store publish the core instance. `<Takt>` boots core in `useEffect`; `useTakt()`/`useTaktEvent()`/`<TaktEvent>` consume it. A separate React-free `./element` entry registers a `<takt-analytics>` custom element. Build with tsup (two entries), `'use client'` preserved on the main entry.

**Tech Stack:** TypeScript, React 18/19, `@vskstudio/takt-core`, tsup, vitest + @testing-library/react + jsdom, size-limit, changesets, ESLint 9.

**Working directory:** `/home/shan/dev/takt-react` (already `git init`-ed; contains only `docs/`).

**Commit identity (all commits):** `git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit ...`. No AI/Claude attribution anywhere.

**Core API reference** (from `@vskstudio/takt-core`):
- `createTakt(config: Config): Analytics` — no autocapture, caller owns it.
- `track(name: string, opts?: TrackOptions): void` — module-singleton fallback (needs `init()`).
- `Analytics` methods used: `track(name, opts?)`, `pageview()`, `enableSpa(): () => void`, `enableOutbound(): () => void`, `enableFiles(exts?: string[]): () => void`, `optOut()`, `optIn()`.
- Exported types: `Config`, `TrackOptions` (`{ props?: Record<string,string>; revenue?: { amount: string; currency: string } }`).

---

### Task 1: Scaffold the package

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `eslint.config.js`, `.gitignore`, `.size-limit.json`, `.changeset/config.json`, `LICENSE`, `test/setup.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@vskstudio/takt-react",
  "version": "0.1.0",
  "description": "Idiomatic React wrapper for Takt privacy-friendly analytics",
  "license": "MIT",
  "author": "VSK Studio",
  "type": "module",
  "types": "./dist/index.d.ts",
  "unpkg": "./dist/element/index.js",
  "jsdelivr": "./dist/element/index.js",
  "sideEffects": ["./dist/element/index.js"],
  "keywords": ["analytics", "privacy", "react", "takt"],
  "homepage": "https://github.com/uyangx/takt-react#readme",
  "repository": { "type": "git", "url": "git+https://github.com/uyangx/takt-react.git" },
  "bugs": { "url": "https://github.com/uyangx/takt-react/issues" },
  "publishConfig": { "access": "public" },
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./element": { "types": "./dist/element/index.d.ts", "import": "./dist/element/index.js" }
  },
  "files": ["dist"],
  "engines": { "node": ">=18" },
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "size": "size-limit",
    "prepublishOnly": "pnpm build",
    "release": "pnpm build && changeset publish"
  },
  "peerDependencies": {
    "@vskstudio/takt-core": ">=0.2.0",
    "react": "^18 || ^19"
  },
  "devDependencies": {
    "@changesets/cli": "^2.31.0",
    "@size-limit/preset-small-lib": "^11.1.6",
    "@testing-library/react": "^16.1.0",
    "@types/react": "^19.0.0",
    "@vskstudio/takt-core": "^0.2.0",
    "eslint": "^9.0.0",
    "jsdom": "^25.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "size-limit": "^11.1.6",
    "tsup": "^8.3.0",
    "typescript": "^5.6.0",
    "typescript-eslint": "^8.0.0",
    "vitest": "^2.1.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "test"]
}
```

- [ ] **Step 3: Create `tsup.config.ts`** (the `'use client'` banner only goes on the main entry, so use two config objects)

```ts
import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    clean: true,
    external: ['react', 'react/jsx-runtime', '@vskstudio/takt-core'],
    banner: { js: "'use client'" },
  },
  {
    entry: { 'element/index': 'src/element/index.ts' },
    format: ['esm'],
    dts: true,
    clean: false,
    noExternal: ['@vskstudio/takt-core'],
  },
])
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
})
```

- [ ] **Step 5: Create `test/setup.ts`**

```ts
import '@testing-library/react'
```

- [ ] **Step 6: Create `eslint.config.js`**

```js
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
)
```

- [ ] **Step 7: Create `.gitignore`**

```
node_modules
dist
*.log
.DS_Store
```

- [ ] **Step 8: Create `.size-limit.json`**

```json
[
  { "name": "index (gzip, react + core external)", "path": "dist/index.js", "limit": "3 kB" },
  { "name": "element (gzip, self-contained)", "path": "dist/element/index.js", "limit": "4 kB" }
]
```

- [ ] **Step 9: Create `.changeset/config.json`**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

- [ ] **Step 10: Create `LICENSE`** — MIT, copyright line `Copyright (c) 2026 uyangx` (copy the exact body from `/home/shan/dev/takt-vue/LICENSE`).

- [ ] **Step 11: Install and verify tooling**

Run: `cd /home/shan/dev/takt-react && pnpm install`
Expected: installs without error. Then `pnpm exec tsc --noEmit` — passes (no source yet, no errors).

- [ ] **Step 12: Commit**

```bash
git add -A
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "chore: scaffold @vskstudio/takt-react"
```

---

### Task 2: `noop.ts` — never-throwing stand-in

**Files:**
- Create: `src/noop.ts`
- Test: `test/noop.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from 'vitest'
import { noopTakt } from '../src/noop'

describe('noopTakt', () => {
  it('never throws and returns a stable instance', () => {
    const a = noopTakt()
    expect(() => a.track('X')).not.toThrow()
    expect(() => a.pageview()).not.toThrow()
    expect(noopTakt()).toBe(a)
  })

  it('warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    noopTakt().track('A')
    noopTakt().track('B')
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test -- noop`
Expected: FAIL — cannot find `../src/noop`.

- [ ] **Step 3: Implement `src/noop.ts`**

```ts
import type { createTakt } from '@vskstudio/takt-core'

export type TaktInstance = ReturnType<typeof createTakt>

let _noop: TaktInstance | null = null
let _warned = false

export function noopTakt(): TaktInstance {
  if (_noop) return _noop
  const warnOnce = (): void => {
    if (_warned) return
    _warned = true
    console.warn('[takt] useTakt() called before <Takt> mounted — returning a no-op instance.')
  }
  _noop = {
    track: warnOnce,
    pageview: warnOnce,
    enableSpa: () => () => {},
    enableOutbound: () => () => {},
    enableFiles: () => () => {},
    optOut: () => {},
    optIn: () => {},
  } as unknown as TaktInstance
  return _noop
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test -- noop`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/noop.ts test/noop.test.ts
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "feat: no-op fallback instance"
```

---

### Task 3: `store.ts` — context + module fallback store

**Files:**
- Create: `src/store.ts`
- Test: `test/store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { taktStore, resolveTakt } from '../src/store'
import type { TaktInstance } from '../src/noop'

describe('store', () => {
  it('resolveTakt returns null when nothing is set', () => {
    taktStore.value = null
    expect(resolveTakt()).toBeNull()
  })

  it('resolveTakt returns the module store value (identity preserved)', () => {
    const fake = { track() {} } as unknown as TaktInstance
    taktStore.value = fake
    expect(resolveTakt()).toBe(fake)
    taktStore.value = null
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test -- store`
Expected: FAIL — cannot find `../src/store`.

- [ ] **Step 3: Implement `src/store.ts`**

```ts
import { createContext, useContext } from 'react'
import type { TaktInstance } from './noop'

export type { TaktInstance }

// Context is the in-tree channel; the module store is the out-of-tree fallback
// so useTaktEvent handlers and non-provider callers still resolve an instance.
export const TaktContext = createContext<TaktInstance | null>(null)

export const taktStore: { value: TaktInstance | null } = { value: null }

// Hook form — must be called during render. Prefers the provider's instance.
export function useResolveTakt(): TaktInstance | null {
  return useContext(TaktContext) ?? taktStore.value
}

// Non-hook form — safe to call at click time / outside React.
export function resolveTakt(): TaktInstance | null {
  return taktStore.value
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test -- store`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/store.ts test/store.test.ts
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "feat: context + module fallback store"
```

---

### Task 4: `useTakt.ts`

**Files:**
- Create: `src/useTakt.ts`
- Test: `test/useTakt.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTakt } from '../src/useTakt'

describe('useTakt', () => {
  it('returns a never-throwing no-op when no instance exists', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { result } = renderHook(() => useTakt())
    expect(() => result.current.track('X')).not.toThrow()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test -- useTakt`
Expected: FAIL — cannot find `../src/useTakt`.

- [ ] **Step 3: Implement `src/useTakt.ts`**

```ts
import { useResolveTakt, type TaktInstance } from './store'
import { noopTakt } from './noop'

/** Returns the live Takt instance provided by `<Takt>`, or a never-throwing no-op. */
export function useTakt(): TaktInstance {
  return useResolveTakt() ?? noopTakt()
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test -- useTakt`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/useTakt.ts test/useTakt.test.tsx
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "feat: useTakt hook"
```

---

### Task 5: `Takt.tsx` — provider component

**Files:**
- Create: `src/Takt.tsx`
- Test: `test/Takt.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

const enableSpa = vi.fn(() => vi.fn())
const enableOutbound = vi.fn(() => vi.fn())
const enableFiles = vi.fn(() => vi.fn())
const pageview = vi.fn()
const createTakt = vi.fn(() => ({ enableSpa, enableOutbound, enableFiles, pageview, track: vi.fn() }))

vi.mock('@vskstudio/takt-core', () => ({ createTakt }))

import { Takt } from '../src/Takt'
import { taktStore } from '../src/store'

beforeEach(() => {
  vi.clearAllMocks()
  taktStore.value = null
})

describe('<Takt>', () => {
  it('boots on mount: createTakt + spa + pageview, publishes to the store', () => {
    render(<Takt domain="example.com">child</Takt>)
    expect(createTakt).toHaveBeenCalledOnce()
    expect(enableSpa).toHaveBeenCalledOnce()
    expect(pageview).toHaveBeenCalledOnce()
    expect(taktStore.value).not.toBeNull()
  })

  it('honors feature toggles and disposes on unmount', () => {
    const dispose = vi.fn()
    enableOutbound.mockReturnValueOnce(dispose)
    const { unmount } = render(<Takt outbound files={['pdf']}>x</Takt>)
    expect(enableOutbound).toHaveBeenCalledOnce()
    expect(enableFiles).toHaveBeenCalledWith(['pdf'])
    unmount()
    expect(taktStore.value).toBeNull()
  })

  it('does not enable spa when spa={false}', () => {
    render(<Takt spa={false}>x</Takt>)
    expect(enableSpa).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test -- Takt`
Expected: FAIL — cannot find `../src/Takt`.

- [ ] **Step 3: Implement `src/Takt.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createTakt } from '@vskstudio/takt-core'
import { TaktContext, taktStore, type TaktInstance } from './store'

export interface TaktProps {
  /** Site identifier sent with every event. Defaults to `location.hostname`. */
  domain?: string
  /** Ingestion endpoint. Defaults to `/api/event`. */
  endpoint?: string
  /** Auto-track outbound link clicks. */
  outbound?: boolean
  /** Auto-track file downloads. Pass an array to restrict to those extensions. */
  files?: boolean | string[]
  /** Track SPA navigations (history pushState/replaceState + popstate). */
  spa?: boolean
  /** Suppress events when the browser's Do Not Track is enabled. */
  respectDnt?: boolean
  /** Suppress events on localhost and private IP ranges. */
  excludeLocalhost?: boolean
  children?: ReactNode
}

export function Takt({
  domain,
  endpoint,
  outbound = false,
  files = false,
  spa = true,
  respectDnt = true,
  excludeLocalhost = true,
  children,
}: TaktProps) {
  const [instance, setInstance] = useState<TaktInstance | null>(null)
  // Read the latest props inside the mount effect without re-running it.
  const props = useRef({ domain, endpoint, outbound, files, spa, respectDnt, excludeLocalhost })
  props.current = { domain, endpoint, outbound, files, spa, respectDnt, excludeLocalhost }

  useEffect(() => {
    const p = props.current
    const takt = createTakt({
      domain: p.domain,
      endpoint: p.endpoint,
      respectDnt: p.respectDnt,
      excludeLocalhost: p.excludeLocalhost,
    })
    const disposers: Array<() => void> = []
    if (p.spa) disposers.push(takt.enableSpa())
    if (p.outbound) disposers.push(takt.enableOutbound())
    if (p.files) disposers.push(takt.enableFiles(Array.isArray(p.files) ? p.files : undefined))
    takt.pageview()

    setInstance(takt)
    taktStore.value = takt

    return () => {
      disposers.forEach((dispose) => dispose())
      setInstance(null)
      taktStore.value = null
    }
  }, [])

  return <TaktContext.Provider value={instance}>{children}</TaktContext.Provider>
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test -- Takt`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/Takt.tsx test/Takt.test.tsx
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "feat: <Takt> provider component"
```

---

### Task 6: `useTaktEvent.ts`

**Files:**
- Create: `src/useTaktEvent.ts`
- Test: `test/useTaktEvent.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const coreTrack = vi.fn()
vi.mock('@vskstudio/takt-core', () => ({ track: coreTrack }))

import { useTaktEvent } from '../src/useTaktEvent'
import { taktStore } from '../src/store'
import type { TaktInstance } from '../src/noop'

beforeEach(() => {
  vi.clearAllMocks()
  taktStore.value = null
})

describe('useTaktEvent', () => {
  it('routes through the resolved instance when present', () => {
    const track = vi.fn()
    taktStore.value = { track } as unknown as TaktInstance
    const { result } = renderHook(() => useTaktEvent({ name: 'Signup', props: { plan: 'pro' } }))
    result.current.onClick()
    expect(track).toHaveBeenCalledWith('Signup', { props: { plan: 'pro' } })
    expect(coreTrack).not.toHaveBeenCalled()
  })

  it('falls back to core track when no instance', () => {
    const { result } = renderHook(() => useTaktEvent({ name: 'Buy', revenue: { amount: '9', currency: 'EUR' } }))
    result.current.onClick()
    expect(coreTrack).toHaveBeenCalledWith('Buy', { revenue: { amount: '9', currency: 'EUR' } })
  })

  it('passes undefined opts when neither props nor revenue set', () => {
    const track = vi.fn()
    taktStore.value = { track } as unknown as TaktInstance
    const { result } = renderHook(() => useTaktEvent({ name: 'Plain' }))
    result.current.onClick()
    expect(track).toHaveBeenCalledWith('Plain', undefined)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test -- useTaktEvent`
Expected: FAIL — cannot find `../src/useTaktEvent`.

- [ ] **Step 3: Implement `src/useTaktEvent.ts`**

```ts
import { useCallback, useRef } from 'react'
import { track as coreTrack } from '@vskstudio/takt-core'
import type { TrackOptions } from '@vskstudio/takt-core'
import { resolveTakt } from './store'

/**
 * Parameters for {@link useTaktEvent} / {@link TaktEvent}. Extends core's
 * `TrackOptions` (`props`, `revenue`) so the wire shape stays in sync, plus `name`.
 */
export interface TaktEventParams extends TrackOptions {
  /** The custom event name to track on click. */
  name: string
}

/**
 * Returns an `{ onClick }` to spread onto any element for declarative click
 * tracking. Resolves the active instance at click time (no stale closure) and
 * falls back to core's default instance for an `init()`-driven setup.
 */
export function useTaktEvent(params: TaktEventParams): { onClick: () => void } {
  const ref = useRef(params)
  ref.current = params
  const onClick = useCallback(() => {
    const { name, props, revenue } = ref.current
    const opts: TrackOptions = {}
    if (props) opts.props = props
    if (revenue) opts.revenue = revenue
    const final = Object.keys(opts).length ? opts : undefined
    const instance = resolveTakt()
    if (instance) instance.track(name, final)
    else coreTrack(name, final)
  }, [])
  return { onClick }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test -- useTaktEvent`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/useTaktEvent.ts test/useTaktEvent.test.tsx
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "feat: useTaktEvent hook"
```

---

### Task 7: `TaktEvent.tsx` — declarative component

**Files:**
- Create: `src/TaktEvent.tsx`
- Test: `test/TaktEvent.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'

vi.mock('@vskstudio/takt-core', () => ({ track: vi.fn() }))

import { TaktEvent } from '../src/TaktEvent'
import { taktStore } from '../src/store'
import type { TaktInstance } from '../src/noop'

beforeEach(() => {
  vi.clearAllMocks()
  taktStore.value = null
})

describe('<TaktEvent>', () => {
  it('tracks on click via the resolved instance', () => {
    const track = vi.fn()
    taktStore.value = { track } as unknown as TaktInstance
    const { getByText } = render(
      <TaktEvent name="Signup"><button>Go</button></TaktEvent>,
    )
    fireEvent.click(getByText('Go'))
    expect(track).toHaveBeenCalledWith('Signup', undefined)
  })

  it('composes the child existing onClick', () => {
    const track = vi.fn()
    taktStore.value = { track } as unknown as TaktInstance
    const childClick = vi.fn()
    const { getByText } = render(
      <TaktEvent name="X"><button onClick={childClick}>Go</button></TaktEvent>,
    )
    fireEvent.click(getByText('Go'))
    expect(childClick).toHaveBeenCalledOnce()
    expect(track).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test -- TaktEvent`
Expected: FAIL — cannot find `../src/TaktEvent`.

- [ ] **Step 3: Implement `src/TaktEvent.tsx`**

```tsx
'use client'

import { Children, cloneElement, isValidElement, type MouseEvent, type ReactElement } from 'react'
import { useTaktEvent, type TaktEventParams } from './useTaktEvent'

type ClickableProps = { onClick?: (e: MouseEvent) => void }

/**
 * Declarative click tracking around a single child element:
 * `<TaktEvent name="Signup"><button>…</button></TaktEvent>`. Composes the
 * child's existing `onClick`; tracks through the active instance.
 */
export function TaktEvent({ children, ...params }: TaktEventParams & { children: ReactElement }) {
  const { onClick } = useTaktEvent(params)
  const child = Children.only(children)
  if (!isValidElement<ClickableProps>(child)) return child
  return cloneElement(child, {
    onClick: (e: MouseEvent) => {
      child.props.onClick?.(e)
      onClick()
    },
  })
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test -- TaktEvent`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/TaktEvent.tsx test/TaktEvent.test.tsx
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "feat: <TaktEvent> declarative component"
```

---

### Task 8: `index.ts` — main entry barrel

**Files:**
- Create: `src/index.ts`
- Test: `test/index.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import * as api from '../src/index'

describe('public API surface', () => {
  it('exports the documented members', () => {
    expect(typeof api.Takt).toBe('function')
    expect(typeof api.useTakt).toBe('function')
    expect(typeof api.useTaktEvent).toBe('function')
    expect(typeof api.TaktEvent).toBe('function')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test -- index`
Expected: FAIL — cannot find `../src/index`.

- [ ] **Step 3: Implement `src/index.ts`**

```ts
export { Takt, type TaktProps } from './Takt'
export { useTakt } from './useTakt'
export { useTaktEvent, type TaktEventParams } from './useTaktEvent'
export { TaktEvent } from './TaktEvent'
export type { TaktInstance } from './store'
export type { Config } from '@vskstudio/takt-core'
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test -- index`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/index.ts test/index.test.ts
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "feat: main entry barrel"
```

---

### Task 9: `./element` — React-free custom element

**Files:**
- Create: `src/element/TaktAnalyticsElement.ts`, `src/element/index.ts`
- Test: `test/element.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const enableSpa = vi.fn(() => vi.fn())
const enableOutbound = vi.fn(() => vi.fn())
const enableFiles = vi.fn(() => vi.fn())
const pageview = vi.fn()
const createTakt = vi.fn(() => ({ enableSpa, enableOutbound, enableFiles, pageview }))
vi.mock('@vskstudio/takt-core', () => ({ createTakt }))

import { defineTaktElement } from '../src/element/index'

beforeEach(() => vi.clearAllMocks())

describe('<takt-analytics> element', () => {
  it('registration is idempotent', () => {
    defineTaktElement()
    defineTaktElement()
    expect(customElements.get('takt-analytics')).toBeTruthy()
  })

  it('boots core on connect; privacy defaults stay on unless "false"', () => {
    defineTaktElement()
    const el = document.createElement('takt-analytics')
    el.setAttribute('domain', 'example.com')
    el.setAttribute('respect-dnt', 'false')
    document.body.appendChild(el)
    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ domain: 'example.com', respectDnt: false, excludeLocalhost: true }),
    )
    expect(enableSpa).toHaveBeenCalledOnce()
    expect(pageview).toHaveBeenCalledOnce()
    el.remove()
  })

  it('enables outbound/files when present as attributes', () => {
    defineTaktElement()
    const el = document.createElement('takt-analytics')
    el.setAttribute('outbound', '')
    el.setAttribute('files', '')
    el.setAttribute('spa', 'false')
    document.body.appendChild(el)
    expect(enableOutbound).toHaveBeenCalledOnce()
    expect(enableFiles).toHaveBeenCalledOnce()
    expect(enableSpa).not.toHaveBeenCalled()
    el.remove()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test -- element`
Expected: FAIL — cannot find `../src/element/index`.

- [ ] **Step 3: Implement `src/element/TaktAnalyticsElement.ts`**

```ts
import { createTakt } from '@vskstudio/takt-core'

// Privacy attrs are default-on: only an explicit "false"/"0" disables them, so
// an absent attribute keeps the core default. Presence flags (outbound/files)
// are on when the attribute exists at all.
const truthy = (v: string | null): boolean => v !== 'false' && v !== '0'

export class TaktAnalyticsElement extends HTMLElement {
  private disposers: Array<() => void> = []

  connectedCallback(): void {
    const attr = (name: string): string | null => this.getAttribute(name)
    const takt = createTakt({
      domain: attr('domain') ?? undefined,
      endpoint: attr('endpoint') ?? undefined,
      respectDnt: truthy(attr('respect-dnt')),
      excludeLocalhost: truthy(attr('exclude-localhost')),
    })
    if (truthy(attr('spa'))) this.disposers.push(takt.enableSpa())
    if (this.hasAttribute('outbound')) this.disposers.push(takt.enableOutbound())
    if (this.hasAttribute('files')) this.disposers.push(takt.enableFiles())
    takt.pageview()
  }

  disconnectedCallback(): void {
    this.disposers.forEach((dispose) => dispose())
    this.disposers = []
  }
}
```

Note: `truthy` for `spa`/`respect-dnt`/`exclude-localhost` returns `true` when the attribute is absent (`null !== 'false'`), preserving the privacy default. `outbound`/`files` use `hasAttribute` so they are off unless present.

- [ ] **Step 4: Implement `src/element/index.ts`**

```ts
import { TaktAnalyticsElement } from './TaktAnalyticsElement'

const TAG = 'takt-analytics'
let defined = false

/** Registers `<takt-analytics>`. Idempotent and SSR-safe. */
export function defineTaktElement(): void {
  if (defined || typeof customElements === 'undefined') return
  if (!customElements.get(TAG)) customElements.define(TAG, TaktAnalyticsElement)
  defined = true
}

defineTaktElement()
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm test -- element`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/element test/element.test.ts
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "feat: React-free <takt-analytics> custom element"
```

---

### Task 10: SSR-safety test

**Files:**
- Test: `test/ssr.test.ts`

- [ ] **Step 1: Write the test**

```ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'

describe('SSR safety (Node, no DOM globals)', () => {
  it('main entry imports without touching window/document', async () => {
    const mod = await import('../src/index')
    expect(typeof mod.Takt).toBe('function')
    expect(typeof mod.useTakt).toBe('function')
  })

  it('element entry imports without registering (no customElements on server)', async () => {
    await expect(import('../src/element/index')).resolves.toBeDefined()
  })
})
```

- [ ] **Step 2: Run to verify it passes**

Run: `pnpm test -- ssr`
Expected: PASS (2 tests). If `customElements` is referenced at import, the guard in `defineTaktElement` (`typeof customElements === 'undefined'`) prevents a throw.

- [ ] **Step 3: Commit**

```bash
git add test/ssr.test.ts
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "test: SSR import safety"
```

---

### Task 11: Build, size budget, full gate

**Files:**
- Verify only (no new source).

- [ ] **Step 1: Run the full local gate**

```bash
pnpm exec eslint .
pnpm typecheck
pnpm test
pnpm build
pnpm size
```

Expected: lint 0 problems; typecheck clean; all tests pass; `dist/index.js`, `dist/index.d.ts`, `dist/element/index.js`, `dist/element/index.d.ts` produced; size within budgets (index < 3 kB gz, element < 4 kB gz).

- [ ] **Step 2: Verify `'use client'` is in the built main entry**

Run: `head -1 dist/index.js`
Expected: first line is `'use client';` (tsup banner). If the budget is exceeded, raise the limit in `.size-limit.json` to the next round number above the measured size and note it in the commit message.

- [ ] **Step 3: Verify the element bundle is React-free**

Run: `grep -c "react" dist/element/index.js || true`
Expected: `0` (no React runtime bundled).

- [ ] **Step 4: Commit any budget adjustment** (only if `.size-limit.json` changed)

```bash
git add .size-limit.json
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "chore: set size budgets to measured values"
```

---

### Task 12: README, CHANGELOG, CI workflow

**Files:**
- Create: `README.md`, `CHANGELOG.md`, `.github/workflows/ci.yml`

- [ ] **Step 1: Create `README.md`** — adapt `/home/shan/dev/takt-vue/README.md`: title `@vskstudio/takt-react`, React badge, install (`pnpm add @vskstudio/takt-react @vskstudio/takt-core`), peer deps `react ^18 || ^19`. Sections: `<Takt>` + `useTakt()` quick start; props table (same 7 props as Vue); declarative tracking with **both** `useTaktEvent` (spread `{...onClick}`) and `<TaktEvent>`; custom element (`import '@vskstudio/takt-react/element'`, React-free note); SSR/Next.js note (`'use client'` is built in — drop `<Takt>` in a client component or the App Router root); Privacy section pointing at core. Code examples must be TSX.

- [ ] **Step 2: Create `CHANGELOG.md`**

```markdown
# @vskstudio/takt-react

## 0.1.0

### Minor Changes

- Initial release: idiomatic React wrapper for Takt analytics.

  - `<Takt>` provider component (SSR-safe boot in `useEffect`, `'use client'`)
  - `useTakt()` hook with a never-throwing no-op fallback
  - `useTaktEvent()` hook and `<TaktEvent>` component for declarative click tracking
  - React-free `<takt-analytics>` custom element via `./element`
```

- [ ] **Step 3: Create `.github/workflows/ci.yml`** — copy `/home/shan/dev/takt-vue/.github/workflows/ci.yml` verbatim, then change only: the matrix axis to `react: ['18', '19']`, the install line to `pnpm add -D react@${{ matrix.react }} react-dom@${{ matrix.react }} @types/react@${{ matrix.react }}`, and keep every hardening field (SHA-pinned actions, `permissions: contents: read`, `concurrency` cancel, `timeout-minutes: 15`, `persist-credentials: false`). The job runs `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm size`.

- [ ] **Step 4: Run the gate once more to confirm nothing broke**

Run: `pnpm exec eslint . && pnpm typecheck && pnpm test && pnpm build && pnpm size`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add README.md CHANGELOG.md .github
git -c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com' commit -m "docs: README + CHANGELOG + hardened CI"
```

---

### Task 13: Create the public GitHub repo and push

**Files:** none.

- [ ] **Step 1: Create the repo and push** (visibility **public**, confirmed by the user)

```bash
cd /home/shan/dev/takt-react
gh repo create uyangx/takt-react --public --source=. --remote=origin --description "Idiomatic React wrapper for Takt privacy-friendly analytics"
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Watch CI to green**

Run: `gh run watch "$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status`
Expected: success on both `build (react@18)` and `build (react@19)`.

- [ ] **Step 3: Apply branch protection** (mirror siblings, after first green CI)

```bash
cat > /tmp/prot.json <<'EOF'
{ "required_status_checks": { "strict": true, "contexts": ["build (react@18)", "build (react@19)"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "dismiss_stale_reviews": true, "require_code_owner_reviews": false, "required_approving_review_count": 1 },
  "restrictions": null }
EOF
gh api --method PUT repos/uyangx/takt-react/branches/main/protection --input /tmp/prot.json --jq '.required_status_checks.contexts'
rm -f /tmp/prot.json
```

Expected: prints the two required check contexts.

---

### Task 14: Publish to npm (gated on user 2FA)

**Files:** none. **Do not run without the user's go-ahead and a valid OTP / bypass-2FA token.**

- [ ] **Step 1: Dry-run**

Run: `cd /home/shan/dev/takt-react && npm publish --dry-run --access public`
Expected: tarball lists `dist/**`, `README.md`, `LICENSE`, `package.json`; no `src`/`test`.

- [ ] **Step 2: Publish** — requires the user to supply a fresh OTP or a granular bypass-2FA token (used in-memory only, never written to a file or CI). Confirm with the user before running.

Run (OTP form): `npm publish --access public --otp=<code>`
Expected: `+ @vskstudio/takt-react@0.1.0`.

- [ ] **Step 3: Verify**

Run: `npm view @vskstudio/takt-react version`
Expected: `0.1.0` (allow a few seconds for CDN propagation).

---

## Notes for the implementer

- **Identity:** every commit uses `-c user.name='Akayashuu' -c user.email='sauvageleo1@gmail.com'`. Never add Claude/AI attribution to commits, PRs, or code.
- **ESLint shadowing:** a global ESLint 10 may shadow the local 9 and break with `context.getSourceCode is not a function`. If `pnpm lint` errors that way, invoke `./node_modules/.bin/eslint .` directly. CI uses the local version and is unaffected.
- **`pnpm test -- <name>`** filters by test file name (vitest passes the arg through as a name pattern).
- **Token hygiene:** the previously exposed npm token (`npm_6YbYH4l7…`) is compromised — never reuse it. Publishing uses the user's OTP or a fresh bypass-2FA granular token, in-memory only.
