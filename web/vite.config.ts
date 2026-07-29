import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // NOT the default 'assets' — the site already serves /assets/resume.pdf
    // from the repo root, and nginx would have a collision.
    assetsDir: 'static',
  },
  server: {
    // Same-origin /api in dev, so the app never needs an API_BASE branch.
    // Mirrors what nginx does in prod (nginx.conf proxies /api to the backend).
    proxy: {
      '/api': 'http://localhost:8081',
      '/audio': 'http://localhost:8081',
      '/clips': 'http://localhost:8081',
      '/uploads': 'http://localhost:8081',
    },
  },
})
