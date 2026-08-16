import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const MIME: Record<string, string> = {
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
}

/**
 * Serve the repo-root static directories in dev.
 *
 * In production nginx serves /img/ and /assets/ straight off the repo root and
 * they are deliberately NOT part of the Vite bundle — img/ alone is 85 MB, with
 * a single 63 MB GIF in it. Moving them into web/public/ would copy all of that
 * into dist on every build.
 *
 * So dev gets a read-only middleware instead. Without it every hover overlay and
 * the résumé link 404s locally, which is exactly the class of dev/prod
 * difference that hides real bugs until deploy.
 *
 * Written against node:fs rather than pulling in a static-file package: this is
 * fifteen lines, it never runs in a build (`apply: 'serve'`), and the video
 * overlay works because Chrome will play a full-body mp4 response without
 * needing range support.
 */
function serveRepoStatic(): Plugin {
  const mounts = ['/img', '/assets']
  return {
    name: 'serve-repo-static',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]
        const mount = mounts.find((m) => url.startsWith(m + '/'))
        if (!mount) return next()

        const root = path.resolve(import.meta.dirname, '..')
        const file = path.join(root, decodeURIComponent(url))
        // Containment check: a crafted ../ path must not read outside the repo.
        if (!file.startsWith(path.join(root, mount.slice(1)))) return next()
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return next()

        res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream')
        fs.createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveRepoStatic()],
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
