import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const isDev = mode === 'development' || command === 'serve';

  return {
    plugins: [preact()],
    resolve: {
      conditions: isDev ? ['development'] : [],
      preserveSymlinks: true,
      alias: {
        '@core': '/src/core',
        '@net':  '/src/net',
        '@cmp':  '/src/components'
      },
    },
    server: {
      watch: {
        usePolling: true
      },
      fs: { allow: ['..'] }
    }
  }
})
