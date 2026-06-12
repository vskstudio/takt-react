import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Resolve the package to its built output so the e2e exercises the real
// published artifact.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@vskstudio/takt-react': resolve(__dirname, '../../dist/index.js'),
    },
  },
})
