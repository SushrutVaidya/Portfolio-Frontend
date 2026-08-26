# Portfolio frontend — multi-stage: build the Vite app, serve it with nginx.
#
# Stage 1 builds web/ (Vite + React + Tailwind v4). Stage 2 is the same
# hardened nginx image as before; only the served content changes.
#
# devquest/ is copied verbatim and is NOT part of the build — it's still the
# original vanilla HTML/CSS/JS sub-app and is served as static files.
#
# Design notes on running nginx:alpine as non-root (unchanged):
#   - Default PID path is `/run/nginx.pid` (root-writable only). We rewrite
#     the `pid` directive in the base nginx.conf to /tmp/nginx.pid at build
#     time — /tmp is world-writable so the `nginx` user can create it.
#   - Bind on 8080 (>1024) so no CAP_NET_BIND_SERVICE needed.
#   - The `user nginx;` directive in the base config becomes a benign
#     warning once we `USER nginx` (only meaningful when master is root).

# ---------- Stage 1: build ----------
# node:22-slim (Debian/glibc), NOT alpine: Tailwind v4's native @tailwindcss/oxide
# binary is unreliable on musl and crashed `npm ci` ("Exit handler never called")
# on the deploy VM. The final served image below is still nginx:alpine.
FROM node:22-slim AS build

WORKDIR /app

# Manifests first, so `npm ci` is cached until dependencies actually change.
COPY web/package.json web/package-lock.json ./
RUN npm ci

# Then sources. Editing a component invalidates only this layer onward.
COPY web/ ./
RUN npm run build

# ---------- Stage 2: serve ----------
FROM nginx:1.27-alpine

# Remove defaults + install our config in one layer.
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

# The built SPA becomes the site root. Bundles land in /static/ (set via
# vite.config.ts build.assetsDir) rather than the Vite default /assets/,
# which would collide with the repo's own assets/resume.pdf below.
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Media and downloads are served straight from the repo, never bundled:
# img/ is ~85 MB (study.gif alone is 63 MB) and putting it through the
# bundler would wreck build times and cache granularity for no benefit.
COPY img/      /usr/share/nginx/html/img/
COPY assets/   /usr/share/nginx/html/assets/

# The untouched DevQuest sub-app, with its own css/ and js/ inside.
COPY devquest/ /usr/share/nginx/html/devquest/

# Give the built-in `nginx` user ownership + point PID at a writable path.
# The sed replaces WHATEVER `pid` line is in the base config (Alpine uses
# `/run/nginx.pid`, Debian variants use `/var/run/nginx.pid` — both match).
RUN chmod -R 755 /usr/share/nginx/html \
 && chown -R nginx:nginx /usr/share/nginx/html \
 && chown -R nginx:nginx /var/cache/nginx \
 && chown -R nginx:nginx /var/log/nginx \
 && chown -R nginx:nginx /etc/nginx/conf.d \
 && sed -i 's|^pid .*|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/ || exit 1

EXPOSE 8080

USER nginx

CMD ["nginx", "-g", "daemon off;"]
