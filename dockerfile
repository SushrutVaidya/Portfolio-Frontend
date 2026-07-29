# Portfolio landing page — optimized image, unprivileged runtime user.
#
# Design notes on running nginx:alpine as non-root:
#   - Default PID path is `/run/nginx.pid` (root-writable only). We rewrite
#     the `pid` directive in the base nginx.conf to /tmp/nginx.pid at build
#     time — /tmp is world-writable so the `nginx` user can create it.
#   - Bind on 8080 (>1024) so no CAP_NET_BIND_SERVICE needed.
#   - The `user nginx;` directive in the base config becomes a benign
#     warning once we `USER nginx` (only meaningful when master is root).
FROM nginx:1.27-alpine

# Remove defaults + install our config in one layer.
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Application files
COPY index.html /usr/share/nginx/html/
COPY css/      /usr/share/nginx/html/css/
COPY img/      /usr/share/nginx/html/img/
COPY assets/   /usr/share/nginx/html/assets/
COPY js/       /usr/share/nginx/html/js/
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
