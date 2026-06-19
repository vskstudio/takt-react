import { describe, it, expect, vi, beforeEach } from 'vitest'

const { enableSpa, enableOutbound, enableFiles, enableTagged, pageview, createTakt } = vi.hoisted(() => {
  const enableSpa = vi.fn(() => vi.fn())
  const enableOutbound = vi.fn(() => vi.fn())
  const enableFiles = vi.fn(() => vi.fn())
  const enable404 = vi.fn(() => vi.fn())
  const enableTagged = vi.fn(() => vi.fn())
  const pageview = vi.fn()
  const createTakt = vi.fn(() => ({ enableSpa, enableOutbound, enableFiles, enable404, enableTagged, pageview }))
  return { enableSpa, enableOutbound, enableFiles, enableTagged, pageview, createTakt }
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

  it('forwards script-origin to the core', () => {
    defineTaktElement()
    const el = document.createElement('takt-analytics')
    el.setAttribute('script-origin', 'https://t.example.com')
    document.body.appendChild(el)
    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ scriptOrigin: 'https://t.example.com' }),
    )
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

  it('forwards sample-rate as sampleRate number', () => {
    defineTaktElement()
    const el = document.createElement('takt-analytics')
    el.setAttribute('sample-rate', '0.5')
    document.body.appendChild(el)
    expect(createTakt).toHaveBeenCalledWith(expect.objectContaining({ sampleRate: 0.5 }))
    el.remove()
  })

  it('omits sampleRate when sample-rate attribute is absent', () => {
    defineTaktElement()
    const el = document.createElement('takt-analytics')
    document.body.appendChild(el)
    expect(createTakt).toHaveBeenCalledOnce()
    expect(createTakt).not.toHaveBeenCalledWith(expect.objectContaining({ sampleRate: expect.anything() }))
    el.remove()
  })

  it('omits sampleRate when sample-rate is malformed (NaN)', () => {
    defineTaktElement()
    const el = document.createElement('takt-analytics')
    el.setAttribute('sample-rate', 'abc')
    document.body.appendChild(el)
    expect(createTakt).toHaveBeenCalledOnce()
    expect(createTakt).not.toHaveBeenCalledWith(expect.objectContaining({ sampleRate: expect.anything() }))
    el.remove()
  })

  it('forwards track-query presence as trackQuery: true', () => {
    defineTaktElement()
    const el = document.createElement('takt-analytics')
    el.setAttribute('track-query', '')
    document.body.appendChild(el)
    expect(createTakt).toHaveBeenCalledWith(expect.objectContaining({ trackQuery: true }))
    el.remove()
  })

  it('forwards query-params CSV as queryParams array', () => {
    defineTaktElement()
    const el = document.createElement('takt-analytics')
    el.setAttribute('query-params', 'utm_source, utm_medium')
    document.body.appendChild(el)
    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ queryParams: ['utm_source', 'utm_medium'] }),
    )
    el.remove()
  })

  it('forwards enabled="false" as enabled: false', () => {
    defineTaktElement()
    const el = document.createElement('takt-analytics')
    el.setAttribute('enabled', 'false')
    document.body.appendChild(el)
    expect(createTakt).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
    el.remove()
  })

  it('calls enableTagged when tagged attribute is present; not called when absent', () => {
    defineTaktElement()
    const elWith = document.createElement('takt-analytics')
    elWith.setAttribute('tagged', '')
    document.body.appendChild(elWith)
    expect(enableTagged).toHaveBeenCalledOnce()
    elWith.remove()

    vi.clearAllMocks()

    const elWithout = document.createElement('takt-analytics')
    document.body.appendChild(elWithout)
    expect(enableTagged).not.toHaveBeenCalled()
    elWithout.remove()
  })
})
