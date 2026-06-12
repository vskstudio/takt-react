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

  it('forwards an incoming ref onto the child DOM node', () => {
    let node: HTMLButtonElement | null = null
    const { getByText } = render(
      <TaktEvent name="X" ref={(el: HTMLButtonElement | null) => { node = el }}>
        <button>Go</button>
      </TaktEvent>,
    )
    expect(node).toBe(getByText('Go'))
  })

  it("composes with the child's pre-existing ref", () => {
    let childNode: HTMLButtonElement | null = null
    let ownNode: HTMLButtonElement | null = null
    const { getByText } = render(
      <TaktEvent name="X" ref={(el: HTMLButtonElement | null) => { ownNode = el }}>
        <button ref={(el) => { childNode = el }}>Go</button>
      </TaktEvent>,
    )
    const btn = getByText('Go')
    expect(childNode).toBe(btn)
    expect(ownNode).toBe(btn)
  })

  it('warns and returns the child unchanged for a non-element child in dev', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<TaktEvent name="X">plain text</TaktEvent>)
    expect(container.textContent).toBe('plain text')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(
      '[takt] <TaktEvent> expects a single React element child; tracking is disabled.',
    )
    warn.mockRestore()
  })
})
