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
