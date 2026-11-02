import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  cacheDir: './.vite',
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5170,
    allowedHosts: true,

    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },

      '/uploads': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
