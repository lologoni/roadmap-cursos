import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// El navegador solo habla con :5173; /api se reenvía al backend (TD-013)
const destinoProxy = process.env.VITE_PROXY_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // xfwd agrega X-Forwarded-For: el rate limit del backend ve la IP real (TD-018)
      '/api': { target: destinoProxy, changeOrigin: false, xfwd: true },
    },
    // Los bind mounts de Windows no propagan eventos del sistema de archivos (riesgo R-04)
    watch: {
      usePolling: true,
      interval: 300,
      ignored: ['**/node_modules/**', '**/.pnpm-store/**', '**/dist/**'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/pruebas/configuracion.js'],
  },
})
