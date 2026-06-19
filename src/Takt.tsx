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
  /** Report a `404` event when the page is an error page (`[data-takt-404]` / `<meta name="takt:404">` marker, or a 404 HTTP status). */
  track404?: boolean
  /** Suppress events when the browser's Do Not Track is enabled. */
  respectDnt?: boolean
  /** Suppress events on localhost and private IP ranges. */
  excludeLocalhost?: boolean
  /** Master on/off switch — set to `false` to disable all tracking at runtime. */
  enabled?: boolean
  /** Fraction of sessions to track (0–1). */
  sampleRate?: number
  /** Include the URL query string in pageview paths. */
  trackQuery?: boolean
  /** Query parameters to preserve when `trackQuery` is true; omit to keep all. */
  queryParams?: string[]
  /** Transform the URL before it is sent; dev-controlled — never build from user input. */
  scrubUrl?: (url: string) => string
  /** Auto-track `[data-takt-tag]` clicks. */
  tagged?: boolean
  children?: ReactNode
}

export function Takt({
  domain,
  endpoint,
  scriptOrigin,
  outbound = false,
  files = false,
  spa = true,
  track404 = false,
  respectDnt = true,
  excludeLocalhost = true,
  enabled,
  sampleRate,
  trackQuery,
  queryParams,
  scrubUrl,
  tagged = false,
  children,
}: TaktProps) {
  const [instance, setInstance] = useState<TaktInstance | null>(null)
  // Read the latest props inside the mount effect without re-running it.
  const props = useRef({ domain, endpoint, scriptOrigin, outbound, files, spa, track404, respectDnt, excludeLocalhost, enabled, sampleRate, trackQuery, queryParams, scrubUrl, tagged })
  props.current = { domain, endpoint, scriptOrigin, outbound, files, spa, track404, respectDnt, excludeLocalhost, enabled, sampleRate, trackQuery, queryParams, scrubUrl, tagged }
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
      enabled: p.enabled,
      sampleRate: p.sampleRate,
      trackQuery: p.trackQuery,
      queryParams: p.queryParams,
      scrubUrl: p.scrubUrl,
    })
    const disposers: Array<() => void> = []
    if (p.spa) disposers.push(takt.enableSpa())
    if (p.outbound) disposers.push(takt.enableOutbound())
    if (p.files) disposers.push(takt.enableFiles(Array.isArray(p.files) ? p.files : undefined))
    if (p.track404) disposers.push(takt.enable404())
    if (p.tagged) disposers.push(takt.enableTagged())
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
