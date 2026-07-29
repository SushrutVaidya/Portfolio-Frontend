/**
 * Projects. Each `highlights` entry states a decision AND its reason — that's
 * the difference between a portfolio a recruiter skims and one an engineer
 * reads. Every item here is drawn from the actual codebase (see
 * Portfolio-Backend/PROJECT_CHEATSHEET.md and CHANGELOG.md), not embellished.
 */

export interface Project {
  slug: string
  name: string
  tagline: string
  /** Short enough to scan in a card, specific enough to be worth reading. */
  summary: string
  status: 'live' | 'archived' | 'wip'
  href?: string
  repo?: string
  stack: readonly string[]
  /** The interesting engineering, not the feature list. */
  highlights: readonly { title: string; detail: string }[]
  metrics?: readonly { value: string; label: string }[]
}

export const projects: readonly Project[] = [
  {
    slug: 'devquest',
    name: 'DevQuest',
    tagline: 'An interactive, gamified portfolio experience',
    summary:
      'A five-stage browser game — captcha, typing trial, incident response — backed by a Spring Boot API with player cards, photo upload, a leaderboard and a capped physical-print giveaway. Built to be a real system, not a demo: versioned migrations, HMAC-signed requests, rate limiting at the edge, and a full test pyramid.',
    status: 'live',
    href: '/devquest/landing.html',
    repo: 'https://github.com/SushrutVaidya/Portfolio-Backend',
    stack: [
      'Java 17',
      'Spring Boot 4',
      'PostgreSQL 16',
      'Redis 7',
      'Flyway',
      'Docker Compose',
      'nginx',
      'Playwright',
    ],
    highlights: [
      {
        title: 'Postgres advisory lock to close a TOCTOU race',
        detail:
          'The giveaway caps at 25 claims. A race between COUNT and INSERT let concurrent requests exceed it. A SERIALIZABLE transaction would have killed throughput, so submission takes pg_advisory_xact_lock on a single key — released on commit. Serialises exactly the one path that needs it and leaves everything else parallel.',
      },
      {
        title: 'Startup fail-fast on the shipped dev secret',
        detail:
          'Auth tokens are HMAC-SHA256(userId, secret). A @PostConstruct guard refuses to boot if the secret still equals the built-in dev default outside the local profile — otherwise a forgotten env var would have made every token forgeable. Verified by a test, not a comment.',
      },
      {
        title: 'Cache-on-failure to stop a silent 400ms regression',
        detail:
          'The Steam integration cached only successful responses, so empty and failed lookups re-hit the upstream on every request — 400ms per call, permanently. Now every outcome caches: 1 hour on success, 2 minutes on empty or failure, short enough that recovery surfaces within minutes without hammering the API.',
      },
      {
        title: 'Request correlation hardened against log injection',
        detail:
          'A servlet filter stamps each request with a short ID, or reuses the client’s X-Request-Id only if it matches a safe-character allowlist — an unvalidated header would let a caller break the single-line JSON log envelope. Support flow: user reports an issue, quotes the ID from response headers, one grep finds the request.',
      },
      {
        title: 'Rate limiting at nginx, not in the application',
        detail:
          'Three zones sized to real cost: 5 r/s for reads, 3 r/min for photo upload (Thumbnailator plus disk I/O), 10 r/min for registration. Security headers live in an included snippet because nginx’s add_header silently replaces the inherited set in any child scope that defines one — a footgun worth documenting.',
      },
      {
        title: 'Performance work driven by traces, not guesses',
        detail:
          'Every jank claim was proven from a Chrome DevTools trace parsed with jq — counting paints at the 16777215px "infinity" clip, GPU tasks over 200ms, and dropped-versus-requested frame ratios. The numbers chose the fixes: drop-shadow filters inflating paint bounds, left/top transitions forcing layout, will-change on fixed elements reserving max-size layers.',
      },
    ],
    metrics: [
      { value: '40', label: 'backend unit + integration tests' },
      { value: '34', label: 'Playwright E2E across 3 projects' },
      { value: '6', label: 'containerised services' },
    ],
  },
  {
    slug: 'portfolio-platform',
    name: 'Portfolio Platform',
    tagline: 'The infrastructure this site runs on',
    summary:
      'A six-service Docker Compose stack sized to a single always-free cloud VM: nginx reverse proxy with automated TLS renewal, Spring Boot API, Postgres with a backup sidecar, Redis, and a static frontend. Deliberately not Kubernetes — the workload does not justify it, and saying so is part of the engineering.',
    status: 'live',
    repo: 'https://github.com/SushrutVaidya/Portfolio-Backend',
    stack: ['Docker Compose', 'nginx', 'certbot', 'PostgreSQL', 'Redis', 'Oracle Cloud'],
    highlights: [
      {
        title: 'Least-privilege containers by default',
        detail:
          'The web tier runs as an unprivileged user: bound above port 1024 so no CAP_NET_BIND_SERVICE is needed, with the PID file relocated to a writable path. Pinned image tags, per-service memory and CPU limits, health checks, and log rotation on every service.',
      },
      {
        title: 'Migrations that adopt an existing database',
        detail:
          'Flyway runs before the application context starts, with baseline-on-migrate enabled so a database that predates version control gets adopted rather than wiped. Schema management is deliberately separate from Hibernate’s DDL generation.',
      },
      {
        title: 'Structured JSON logging',
        detail:
          'Single-line JSON via a Logback pattern, correlated by request ID, so container logs are greppable and parseable without a log shipper — appropriate for a one-VM deployment where running an ELK stack would cost more than the application.',
      },
      {
        title: 'A runbook, because deploys should be boring',
        detail:
          'A ten-section deploy document takes an empty cloud tenancy to a live HTTPS site, plus daily operations, backup, rollback, and cost notes. Paired with a post-deploy smoke checklist.',
      },
    ],
  },
  {
    slug: 'solar-plc',
    name: 'Solar Energy Production Using PLC',
    tagline: 'Granted patent — Government of India',
    summary:
      'A control system that maximises photovoltaic output by driving panel orientation from Programmable Logic Controllers and IoT sensor input, tracking the sun’s position automatically rather than on a fixed schedule.',
    status: 'archived',
    href: 'https://ycce.edu/wp-content/uploads/2025/01/107_202221077674.pdf',
    stack: ['PLC', 'IoT sensors', 'Control systems'],
    highlights: [
      {
        title: 'Patent No. 551111',
        detail: 'Filed December 2022, granted September 2024 by the Government of India.',
      },
    ],
  },
] as const
