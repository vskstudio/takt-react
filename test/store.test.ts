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
