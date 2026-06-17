'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createTakt } from '@vskstudio/takt-core'
import { TaktContext, taktStore, type TaktInstance } from './store'

export interface TaktProps {
  /** Site identifier sent with every event. Defaults to `location.hostname`. */
  domain?: string
  /** Ingestion endpoint. Defaults to `/api/event`. */
  endpoint?: string
  /** First-party origin to derive the endpoint from (`{origin}/api/event`); `endpoint` wins over it. */
  scriptOrigin?: string
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
  scriptOrigin,
  outbound = false,
  files = false,
  spa = true,
  respectDnt = true,
  excludeLocalhost = true,
  children,
}: TaktProps) {
  const [instance, setInstance] = useState<TaktInstance | null>(null)
  // Read the latest props inside the mount effect without re-running it.
  const props = useRef({ domain, endpoint, scriptOrigin, outbound, files, spa, respectDnt, excludeLocalhost })
  props.current = { domain, endpoint, scriptOrigin, outbound, files, spa, respectDnt, excludeLocalhost }
  // Survives StrictMode's setup→cleanup→setup, so the remount boot can tell it
  // is the same component and skip a duplicate initial pageview.
  const didPageview = useRef(false)

  useEffect(() => {
    const p = props.current
    const takt = createTakt({
      domain: p.domain,
      endpoint: p.endpoint,
      scriptOrigin: p.scriptOrigin,
      respectDnt: p.respectDnt,
      excludeLocalhost: p.excludeLocalhost,
    })
    const disposers: Array<() => void> = []
    if (p.spa) disposers.push(takt.enableSpa())
    if (p.outbound) disposers.push(takt.enableOutbound())
    if (p.files) disposers.push(takt.enableFiles(Array.isArray(p.files) ? p.files : undefined))
    if (!didPageview.current) {
      didPageview.current = true
      takt.pageview()
    }

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

Takt.displayName = 'Takt'
