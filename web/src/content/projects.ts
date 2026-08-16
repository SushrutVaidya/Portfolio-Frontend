/**
 * Projects. Each `highlights` entry states a decision AND its reason — that's
 * the difference between a portfolio a recruiter skims and one an engineer
 * reads. Every item here is drawn from the actual codebase (see
 * Portfolio-Backend/PROJECT_CHEATSHEET.md and CHANGELOG.md), not embellished.
 */

/**
 * Per-project accent, applied ONLY on the case-study route, where the project
 * owns the whole page — the approach david-hckh.com takes with its .project-*
 * classes.
 *
 * Deliberately NOT applied to the home page. The single-accent rule is what
 * keeps the composition coherent; re-theming three consecutive frames there
 * produced exactly the competing-colour problem it exists to prevent.
 *
 * Values are chosen against the near-black ground (#12100e). The previous set
 * was picked for a cream background — #176cfe in particular is legible on paper
 * and nearly invisible on this ground.
 */
export interface ProjectTheme {
  accent: string
}

export interface CaseStudyBlock {
  /** Two-digit label, set in the pixel face. */
  index: string
  heading: string
  body: string
}

export interface Project {
  slug: string
  name: string
  tagline: string
  /** Short enough to scan in a card, specific enough to be worth reading. */
  summary: string
  status: 'live' | 'archived' | 'wip'
  /** Displayed on the rail card and case-study masthead. */
  year: string
  role: string
  href?: string
  repo?: string
  stack: readonly string[]
  theme: ProjectTheme
  /** The interesting engineering, not the feature list. */
  highlights: readonly { title: string; detail: string }[]
  metrics?: readonly { value: string; label: string }[]
  /** Long-form case study, shown at /work/:slug. */
  study?: readonly CaseStudyBlock[]
}

export const projects: readonly Project[] = [
  {
    slug: 'devquest',
    name: 'DevQuest',
    tagline: 'An interactive, gamified portfolio experience',
    summary:
      'A five-stage browser game — captcha, typing trial, incident response — backed by a Spring Boot API with player cards, photo upload, a leaderboard and a capped physical-print giveaway. Built to be a real system, not a demo: versioned migrations, HMAC-signed requests, rate limiting at the edge, and a full test pyramid.',
    status: 'live',
    year: '2026',
    role: 'Sole engineer — API, frontend, infrastructure',
    // DevQuest's own brand yellow, warmed so it doesn't glare on near-black.
    theme: { accent: '#f2c14e' },
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
    study: [
      {
        index: '01',
        heading: 'The problem with portfolio sites',
        body: 'A portfolio claims you can build systems, then demonstrates a static page. I wanted the artefact to be the evidence: something with real state, real concurrency, real failure modes, that a reader could poke at and an interviewer could interrogate. So DevQuest is a game on the surface and a production service underneath — registration, authenticated mutation, a leaderboard, file upload, and a capped giveaway that people actually compete for.',
      },
      {
        index: '02',
        heading: 'Where the interesting bug was',
        body: 'The print giveaway allows 25 claims. The naive implementation counts existing rows, compares to the cap, then inserts — and under concurrency two requests can both read 24 and both insert. Wrapping the whole transaction in SERIALIZABLE fixes it and destroys throughput on every unrelated path. Instead the submission takes pg_advisory_xact_lock keyed on a single integer, held until commit. One path serialises; everything else stays parallel. That distinction — scoping a lock to the invariant rather than the transaction — is the actual engineering.',
      },
      {
        index: '03',
        heading: 'Auth sized to the threat',
        body: 'The real risk was someone reading a UUID off the public leaderboard and overwriting that player\u2019s card. It was not state-sponsored attackers. So tokens are HMAC-SHA256(userId, serverSecret): deterministic, stateless, no session store, no Redis dependency. Comparison is constant-time. What it deliberately does not defend against is a user handing their own token to a friend, which for a portfolio game is an acceptable loss. Writing down what a design does not protect is part of proposing it.',
      },
      {
        index: '04',
        heading: 'The guard that matters more than the crypto',
        body: 'Good crypto with a leaked secret is worthless, and the most likely leak was mundane: deploying without setting AUTH_HMAC_SECRET, silently falling back to the dev default committed in source, and making every token forgeable. So a @PostConstruct check refuses to start the application if the secret still equals that default outside the local profile. It fails loudly at boot instead of quietly in production, and a test asserts it.',
      },
      {
        index: '05',
        heading: 'Measuring before optimising',
        body: 'The frontend felt janky and every theory about why was wrong. Chrome DevTools traces parsed with jq gave the answer: hundreds of paint events at the 16777215px "infinity" clip rect, GPU tasks over 200ms, and a dropped-to-requested frame ratio that named the offending components. The causes were unglamorous — drop-shadow filters inflating paint bounds, left/top transitions forcing layout, will-change on fixed elements reserving max-texture-size layers. Every fix was chosen by a number, and the same traces proved they worked.',
      },
      {
        index: '06',
        heading: 'What I would do differently',
        body: 'The API is one controller with eight injected services and three raw Map request bodies alongside one properly validated DTO — it should have been split per domain with constructor injection from the start. The giveaway cap is also duplicated as a literal in the controller instead of reading the service constant, so changing it would make the count endpoint disagree with enforcement. Both are cheap to fix and both are the kind of thing that only becomes obvious once the surface stops being small.',
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
    year: '2026',
    role: 'Sole engineer — platform and deployment',
    // Lifted well off #176cfe, which fails contrast against this ground.
    theme: { accent: '#6aa6ff' },
    repo: 'https://github.com/SushrutVaidya/Portfolio-Backend',
    stack: ['Docker Compose', 'nginx', 'certbot', 'PostgreSQL', 'Redis', 'Oracle Cloud'],
    study: [
      {
        index: '01',
        heading: 'Choosing not to use Kubernetes',
        body: 'The workload is one API, one database, a cache and a static site, serving portfolio traffic. Kubernetes would add a control plane, an ingress controller, manifests and an upgrade treadmill to run six containers that fit comfortably on a single always-free VM. Docker Compose with pinned tags, per-service resource limits, health checks and log rotation does the whole job in one file. Knowing when infrastructure is unnecessary is worth more than being able to configure it.',
      },
      {
        index: '02',
        heading: 'Treating a hobby deploy like a real one',
        body: 'Least privilege everywhere: the web tier runs as an unprivileged user, bound above port 1024 so it needs no networking capability, with its PID file relocated to a writable path. Schema changes go through versioned migrations that run before the application context starts, with baseline-on-migrate enabled so a database predating version control gets adopted rather than dropped. Logs are single-line JSON correlated by request ID, greppable without a log shipper.',
      },
      {
        index: '03',
        heading: 'The lesson that cost the most',
        body: 'For a period the only copy of the running frontend was the VM itself — no git remote, no local clone. Recovering it meant tarring the deployment and reconstructing history from what the server happened to still hold. Deploys are now the thing that follow the repository, not the other way round, and the runbook exists so that recovery is a procedure rather than an improvisation.',
      },
    ],
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
    year: '2022–24',
    role: 'Co-inventor',
    theme: { accent: '#dfd94f' },
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
