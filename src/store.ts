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
