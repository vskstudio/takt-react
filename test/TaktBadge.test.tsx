import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

const { badgeUrl } = vi.hoisted(() => ({
  badgeUrl: vi.fn((domain: string, opts: Record<string, unknown>) => `/public/${domain}/badge.svg?${JSON.stringify(opts)}`),
}))
vi.mock('@vskstudio/takt-core', () => ({ badgeUrl }))

import { TaktBadge } from '../src/TaktBadge'

beforeEach(() => vi.clearAllMocks())

describe('<TaktBadge>', () => {
  it('builds src from domain and options, with defaults', () => {
    const { getByAltText } = render(<TaktBadge domain="example.com" variant="d" glyph="dash" lang="fr" host="https://t.io" />)
    const img = getByAltText('takt') as HTMLImageElement
    expect(badgeUrl).toHaveBeenCalledWith('example.com', { host: 'https://t.io', variant: 'd', glyph: 'dash', lang: 'fr' })
    expect(img.getAttribute('src')).toBe(badgeUrl.mock.results[0]!.value)
    expect(img.getAttribute('loading')).toBe('lazy')
    expect(img.getAttribute('decoding')).toBe('async')
  })

  it('spreads passthrough img attributes and allows alt override', () => {
    const { getByAltText } = render(<TaktBadge domain="x.com" alt="stats" className="b" />)
    const img = getByAltText('stats') as HTMLImageElement
    expect(img.className).toBe('b')
  })

  it('does not let a consumer-passed src override the built URL', () => {
    const { getByAltText } = render(
      // @ts-expect-error src is wrapper-controlled and omitted from props
      <TaktBadge domain="example.com" src="https://evil.example/x.svg" />,
    )
    const img = getByAltText('takt') as HTMLImageElement
    expect(img.getAttribute('src')).toBe(badgeUrl.mock.results[0]!.value)
    expect(img.getAttribute('src')).not.toContain('evil')
  })
})
