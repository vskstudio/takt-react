import { describe, it, expect, vi, beforeEach } from 'vitest'

const { enableSpa, enableOutbound, enableFiles, pageview, createTakt } = vi.hoisted(() => {
  const enableSpa = vi.fn(() => vi.fn())
  const enableOutbound = vi.fn(() => vi.fn())
  const enableFiles = vi.fn(() => vi.fn())
  const pageview = vi.fn()
  const createTakt = vi.fn(() => ({ enableSpa, enableOutbound, enableFiles, pageview }))
  return { enableSpa, enableOutbound, enableFiles, pageview, createTakt }
})
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
