// @vitest-environment node
import { describe, it, expect } from 'vitest'

describe('SSR safety (Node, no DOM globals)', () => {
  it('main entry imports without touching window/document', async () => {
    const mod = await import('../src/index')
    expect(typeof mod.Takt).toBe('function')
    expect(typeof mod.useTakt).toBe('function')
  })

  it('element entry imports without registering (no customElements on server)', async () => {
    await expect(import('../src/element/index')).resolves.toBeDefined()
  })
})
