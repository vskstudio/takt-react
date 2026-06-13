import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

const { embedUrl } = vi.hoisted(() => ({
  embedUrl: vi.fn((domain: string, opts: Record<string, unknown>) => `/embed/${domain}?${JSON.stringify(opts)}`),
}))
vi.mock('@vskstudio/takt-core', () => ({ embedUrl }))

import { TaktEmbed } from '../src/TaktEmbed'

beforeEach(() => vi.clearAllMocks())

describe('<TaktEmbed>', () => {
  it('builds src from domain and options, with defaults', () => {
    const { getByTitle } = render(<TaktEmbed domain="example.com" theme="dark" lang="en" host="https://t.io" />)
    const frame = getByTitle('takt') as HTMLIFrameElement
    expect(embedUrl).toHaveBeenCalledWith('example.com', { host: 'https://t.io', theme: 'dark', lang: 'en' })
    expect(frame.getAttribute('src')).toBe(embedUrl.mock.results[0]!.value)
    expect(frame.getAttribute('width')).toBe('404')
    expect(frame.getAttribute('height')).toBe('264')
    expect(frame.getAttribute('loading')).toBe('lazy')
    expect(frame.style.border).toBe('0px')
  })

  it('merges passthrough style and honors overrides', () => {
    const { getByTitle } = render(
      <TaktEmbed domain="x.com" title="dash" width={600} style={{ borderRadius: '8px' }} />,
    )
    const frame = getByTitle('dash') as HTMLIFrameElement
    expect(frame.getAttribute('width')).toBe('600')
    expect(frame.style.borderRadius).toBe('8px')
    expect(frame.style.border).toBe('0px')
  })
})
