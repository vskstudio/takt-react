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
