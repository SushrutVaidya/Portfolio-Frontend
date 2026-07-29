# PROJECT CHEAT-SHEET — DevQuest / Portfolio

Glance at this before an interview instead of re-reading every file.
Five bullet points on architecture, five on the most interesting
engineering decisions. Everything here is defensible in 30 seconds.

---

## Architecture (5 bullets)

- **Two-repo split.** `Portfolio-Backend` (Spring Boot 4.0.2, Java 17,
  Postgres, optional Upstash Redis) exposes a small REST surface at
  `/api/*`. `portfolio-frontend` is vanilla HTML/CSS/JS — no framework,
  no build step — served by an nginx container. Nginx-proxy fronts both
  and terminates TLS.

- **Docker Compose one-VM deploy.** Every service (`postgres`,
  `portfolio-backend`, `portfolio-frontend`, `nginx-proxy`, `certbot`,
  `postgres-backup`) sized for OCI Ampere A1.Flex 4 OCPU / 24 GB free
  tier. Pinned image tags, per-service `mem_limit` + `cpus`, YAML
  log-rotation anchor, healthchecks. `docker-compose.override.yml`
  publishes 5432/8081/8080 for local dev, gitignored so it never lands
  on OCI.

- **HMAC weak-auth over the JDK.** `AuthTokenService` computes
  `HMAC-SHA256(userId, secret)` and returns it on register. Frontend
  sends `X-DQ-Token` on every mutating request; backend calls
  `auth.assertOwns(id, http)` in `updateCard`, `uploadPhoto`,
  `submitScore`. Deterministic — same name registration returns the
  same token; 401 on the FE triggers a **single in-flight re-register
  promise** that dedups concurrent refreshes.

- **Flyway V1 + V2 versioned migrations** run before Spring starts.
  `baseline-on-migrate=true` so existing DBs (EC2) get adopted without
  wiping. `ddl-auto=update` for now as a safety net; flip to
  `validate` once schema is stable.

- **Rate limiting at nginx, not in the app.** Three zones:
  `api` (5 r/s burst 20), `upload` (3 r/m — photo endpoint is
  Thumbnailator + disk), `auth` (10 r/m — the register endpoint).
  Security headers extracted to a snippet and `include`d in every
  location that overrides any header, because nginx's `add_header`
  child-scope silently REPLACES the parent set (footgun).

---

## Interesting engineering decisions (5 bullets)

- **`pg_advisory_xact_lock` on print-request submission.** 25-slot
  giveaway; TOCTOU-race between `count` and `save` would let >25 rows
  land. Rather than a serializable transaction (dead for concurrency),
  we take a Postgres advisory lock keyed to one int, release on commit.
  Serializes exactly the one path that needs it, everything else stays
  parallel.

- **Cache-on-failure for Steam.** `SteamService` had a subtle bug:
  the "empty games list" and "exception" paths returned `List.of()`
  WITHOUT stamping the cache, so every request re-hit Steam. Trace
  showed 400 ms per call, forever. Fix: any result (including empty)
  caches. TTL is 1 hour on a successful call, 2 minutes on an empty /
  failed one — short enough that Upstash recovering shows within
  minutes, long enough that we don't hammer Steam.

- **Frontend perf: measure first, don't guess.** Every jank claim
  proved with a Chrome DevTools trace analyzed via `jq` — counts of
  Paint events at Chrome's 16777215×16777215 "infinity" clip, GPU tasks
  over 200 ms, DroppedFrame vs BeginFrame ratio. The trace numbers
  drove which CSS properties to change (`filter: drop-shadow` blows
  paint bounds; `left/top` transitions trigger layout;
  `will-change: transform` on `position: fixed` reserves a
  max-texture-size layer). Trace-driven fixes shipped: cursor rewrite,
  landing orb filter removal, captcha `holeAccept` swap, DevType word
  cursor.

- **Structured JSON logging + `X-Request-Id` correlation.** `RequestIdFilter`
  stamps every request with a short UUID (or accepts the client's
  `X-Request-Id` if it matches a safe-char whitelist — defense against
  log-injection breaking the JSON envelope). Logback pattern emits
  single-line JSON. Ops flow: user reports issue → grabs the
  `X-Request-Id` from their DevTools response headers → we grep the
  container log for that one line.

- **Startup fail-fast on the shipped dev secret.** `AuthTokenService`
  has a `@PostConstruct` guard: if `auth.hmac-secret` equals the built-in
  dev default AND the active Spring profile isn't `local`, the app
  refuses to start. Prevents the "forgot to set AUTH_HMAC_SECRET on OCI"
  footgun that would have made every user's token forgeable. Covered
  by `AuthTokenServiceTest.startupFailsIfDevSecretInProdProfile`.

---

## Deploy-readiness snapshot

- **Backend tests:** 40 unit + integration passing, JaCoCo coverage
  gate at ≥30% BUNDLE INSTRUCTION.
- **Frontend E2E:** 34 Playwright tests across chromium + firefox +
  mobile-chromium projects.
- **Deploy runbook:** `Portfolio-Backend/DEPLOY.md` — 10 sections,
  copy-pasteable OCI setup from empty tenancy to live TLS site in
  ~60 min (half of which is DNS propagation).

## What's NOT done, deliberately

- **Motion tokens** (unify durations + easings) — 200+ rules to touch,
  invisible unless side-by-side A/B'd. Documented in
  `PERFORMANCE_NOTES.md` for future pickup.
- **OKE / OCI Container Instances** — single-VM Compose stack is
  sufficient for portfolio traffic; K8s is over-engineering here.
- **CSP without `'unsafe-inline'`** — would need a build step to hash
  inline `<script>`/`<style>` blocks. Out of scope for a
  no-build-pipeline codebase.
- **CI wiring** — E2E suite is CI-ready, GitHub Actions workflow YAML
  documented in `tests/README.md` but not committed (needs repo-specific
  secrets).
