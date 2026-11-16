import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  cacheDir: './.vite',
  plugins: [
    react(),
    {
      name: 'client-error-logger',
      configureServer(server) {
        server.middlewares.use('/api/dev/client-error', (req, res) => {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const logPath = path.resolve(__dirname, 'client_last_error.log');
              fs.writeFileSync(logPath, body, 'utf8');
              console.error('\n[CLIENT ERROR CAPTURED]:', body, '\n');
            } catch (e) {
              console.error('Failed to write error log:', e);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          });
        });
      }
    }
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,

    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },

      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
