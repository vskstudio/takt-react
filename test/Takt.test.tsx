import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'

const { enableSpa, enableOutbound, enableFiles, pageview, createTakt } = vi.hoisted(() => {
  const enableSpa = vi.fn(() => vi.fn())
  const enableOutbound = vi.fn(() => vi.fn())
  const enableFiles = vi.fn(() => vi.fn())
  const pageview = vi.fn()
  const createTakt = vi.fn(() => ({ enableSpa, enableOutbound, enableFiles, pageview, track: vi.fn() }))
  return { enableSpa, enableOutbound, enableFiles, pageview, createTakt }
})

vi.mock('@vskstudio/takt-core', () => ({ createTakt }))

import { Takt } from '../src/Takt'
import { useTakt } from '../src/useTakt'
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

  it('forwards scriptOrigin to createTakt', () => {
    render(<Takt scriptOrigin="https://t.example.com">x</Takt>)
    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ scriptOrigin: 'https://t.example.com' }),
    )
  })

  it('honors feature toggles and disposes on unmount', () => {
    const disposeSpa = vi.fn()
    const disposeOutbound = vi.fn()
    enableSpa.mockReturnValueOnce(disposeSpa)
    enableOutbound.mockReturnValueOnce(disposeOutbound)
    const { unmount } = render(<Takt outbound files={['pdf']}>x</Takt>)
    expect(enableOutbound).toHaveBeenCalledOnce()
    expect(enableFiles).toHaveBeenCalledWith(['pdf'])
    expect(disposeSpa).not.toHaveBeenCalled()
    expect(disposeOutbound).not.toHaveBeenCalled()
    unmount()
    expect(disposeSpa).toHaveBeenCalledOnce()
    expect(disposeOutbound).toHaveBeenCalledOnce()
    expect(taktStore.value).toBeNull()
  })

  it('does not enable spa when spa={false}', () => {
    render(<Takt spa={false}>x</Takt>)
    expect(enableSpa).not.toHaveBeenCalled()
  })

  it('provides the live instance via React context to useTakt()', () => {
    const created = { enableSpa, enableOutbound, enableFiles, pageview, track: vi.fn() }
    createTakt.mockReturnValueOnce(created)
    let seen: unknown
    function Child() {
      seen = useTakt()
      return null
    }
    render(
      <Takt>
        <Child />
      </Takt>,
    )
    expect(seen).toBe(created)
  })

  describe('under StrictMode', () => {
    it('settles to one live instance and exactly one initial pageview', () => {
      const { unmount } = render(
        <React.StrictMode>
          <Takt>x</Takt>
        </React.StrictMode>,
      )
      // Double-invoke may create twice, but exactly one instance stays live.
      expect(pageview).toHaveBeenCalledOnce()
      expect(taktStore.value).not.toBeNull()
      unmount()
      expect(taktStore.value).toBeNull()
    })

    it('disposes every instance it booted by final unmount', () => {
      const disposers: ReturnType<typeof vi.fn>[] = []
      createTakt.mockImplementation(() => {
        const dispose = vi.fn()
        disposers.push(dispose)
        return {
          enableSpa: vi.fn(() => dispose),
          enableOutbound: vi.fn(() => vi.fn()),
          enableFiles: vi.fn(() => vi.fn()),
          pageview,
          track: vi.fn(),
        }
      })
      const { unmount } = render(
        <React.StrictMode>
          <Takt>x</Takt>
        </React.StrictMode>,
      )
      unmount()
      expect(disposers.length).toBeGreaterThanOrEqual(1)
      disposers.forEach((dispose) => expect(dispose).toHaveBeenCalledOnce())
    })
  })
})
