import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    clean: true,
    external: ['react', 'react/jsx-runtime', '@vskstudio/takt-core'],
    banner: { js: "'use client'" },
  },
  {
    entry: { 'element/index': 'src/element/index.ts' },
    format: ['esm'],
    dts: true,
    clean: false,
    noExternal: ['@vskstudio/takt-core'],
  },
])
