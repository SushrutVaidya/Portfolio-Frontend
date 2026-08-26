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
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

/**
 * Serve the repo-root static directories in dev.
 *
 * In production nginx serves /img/, /assets/ and the decoupled DevQuest sub-app
 * at /devquest/ straight off the repo root — they are deliberately NOT part of
 * the Vite bundle (img/ alone is 85 MB). This middleware mirrors that in dev so
 * the same relative URLs resolve locally instead of falling through to the SPA
 * 404, which is exactly the class of dev/prod gap that hides bugs until deploy.
 *
 * /devquest matches the nginx rule: bare /devquest/ (and unknown /devquest/*
 * paths) serve the sub-app's landing.html entry, files underneath serve directly.
 *
 * Written against node:fs rather than a static-file package: it never runs in a
 * build (`apply: 'serve'`), and the video overlay works because Chrome plays a
 * full-body mp4 response without needing range support.
 */
function serveRepoStatic(): Plugin {
  const mounts = ['/img', '/assets', '/devquest']
  return {
    name: 'serve-repo-static',
    apply: 'serve',
    configureServer(server) {
      const root = path.resolve(import.meta.dirname, '..')
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]

        // Bare /devquest → redirect to the trailing-slash form (matches nginx).
        if (url === '/devquest') {
          res.statusCode = 308
          res.setHeader('Location', '/devquest/')
          res.end()
          return
        }

        const mount = mounts.find((m) => url === m || url.startsWith(m + '/'))
        if (!mount) return next()

        let file = path.join(root, decodeURIComponent(url))
        // Containment check: a crafted ../ path must not read outside the repo.
        if (!file.startsWith(path.join(root, mount.slice(1)))) return next()

        // DevQuest is an app, not a file tree: fall unknown paths back to its
        // landing.html entry (mirrors nginx `try_files ... /devquest/landing.html`).
        if (mount === '/devquest' && (!fs.existsSync(file) || !fs.statSync(file).isFile())) {
          file = path.join(root, 'devquest', 'landing.html')
        }
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
    // The image dirs (kitchen/gamer/social/otaku) + clips/audio are backend
    // static resources the DevQuest sub-app references at absolute paths.
    proxy: {
      '/api': 'http://localhost:8081',
      '/audio': 'http://localhost:8081',
      '/clips': 'http://localhost:8081',
      '/uploads': 'http://localhost:8081',
      '/kitchen': 'http://localhost:8081',
      '/gamer': 'http://localhost:8081',
      '/social': 'http://localhost:8081',
      '/otaku': 'http://localhost:8081',
    },
  },
})
