import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const isDev = mode === 'development' || command === 'serve';
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  return {
    plugins: [preact()],
    resolve: {
      conditions: isDev ? ['development'] : [],
      preserveSymlinks: true,
      alias: {
        '@core': '/src/core',
        '@net':  '/src/net',
        '@cmp':  '/src/components',
        // In dev, load game-logic straight from source to enable HMR without reinstall
        'pixel-legion-game-logic': isDev
          ? path.resolve(__dirname, '../game-logic/src/index.ts')
          : 'pixel-legion-game-logic'
      },
    },
    optimizeDeps: {
      // Avoid prebundling the local package so edits are picked up immediately in dev
      exclude: ['pixel-legion-game-logic'],
    },
    server: {
      watch: {
        usePolling: true
      },
      fs: { allow: ['..'] }
    }
  }
})
