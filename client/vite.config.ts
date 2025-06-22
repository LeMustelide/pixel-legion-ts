import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@core': '/src/core',
      '@net':  '/src/net',
      '@cmp':  '/src/components',
    },
  },
  server: {
    watch: {
      usePolling: true
    },
  },
})
