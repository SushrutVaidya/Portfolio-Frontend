#!/usr/bin/env bash
#
# One-shot screenshot runner. Fixes the recurring pain:
#   - force-kills any prior/suspended vite server holding the port (SIGKILL,
#     because a shell-suspended process ignores SIGTERM and keeps the port)
#   - starts the dev server DETACHED from the tty (< /dev/null), so it never
#     gets "suspended (tty input)"
#   - waits for the server's REAL url from the log (it may pick 5174 if 5173 is
#     briefly still held) and passes it to the harness
#   - cleans up afterwards
#
# Usage:  bash tests/shoot.sh
set -u

echo "▸ clearing any running vite / dev servers…"
lsof -ti:5173 -ti:5174 2>/dev/null | xargs -r kill -9 2>/dev/null || true
pkill -9 -f 'vite' 2>/dev/null || true
sleep 1

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "▸ starting dev server (detached)…"
( cd "$ROOT/web" && nohup npm run dev < /dev/null > /tmp/vite.log 2>&1 & )

# Wait for a ready url in the log, then confirm it answers.
URL=""
for _ in $(seq 1 40); do
  URL="$(grep -oE 'http://localhost:[0-9]+' /tmp/vite.log 2>/dev/null | head -1)"
  if [ -n "$URL" ] && curl -sf -o /dev/null "$URL"; then break; fi
  sleep 0.5
done

if [ -z "$URL" ]; then
  echo "✗ dev server never came up. Log:"; tail -20 /tmp/vite.log; exit 1
fi
echo "▸ server ready at $URL"

echo "▸ shooting…"
( cd "$ROOT/tests" && node shots.mjs "$URL" )
STATUS=$?

echo "▸ stopping dev server…"
pkill -9 -f 'vite' 2>/dev/null || true

[ $STATUS -eq 0 ] && echo "✓ done → tests/shots/  (tell Claude)" || echo "✗ shots failed (status $STATUS)"
exit $STATUS
