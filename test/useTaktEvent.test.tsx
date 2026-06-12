import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const { coreTrack } = vi.hoisted(() => ({ coreTrack: vi.fn() }))
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
