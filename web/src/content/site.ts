/**
 * Site-level facts. Single source of truth — no copy lives in JSX.
 *
 * Everything here is verifiable from the repos or the previous site. Fields I
 * could not verify are marked TODO rather than invented; fill them in and the
 * UI picks them up. Do not add unverifiable claims: a recruiter checking one
 * false detail discounts everything else on the page.
 */

export const profile = {
  name: 'Sushrut Vaidya',
  role: 'Platform Engineer',
  location: 'Hyderabad, IN',
  // Verbatim from the previous site's meta description.
  tagline: 'Platform Engineer at Apple AdPlatforms — Java, Spring Boot, Docker, Kubernetes, AWS',
  email: 'sushrutsv@outlook.com',
  resume: '/assets/resume.pdf',
} as const

export const links = {
  github: 'https://github.com/SushrutVaidya',
  linkedin: 'https://linkedin.com/in/Sushrutsvaidya',
  steam: 'https://steamcommunity.com/profiles/76561199065609624',
  devquest: '/devquest/landing.html',
  // The rickroll. Kept deliberately — the counter behind it is a real
  // Redis-backed endpoint, which is the joke.
  youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
} as const

/**
 * Headline metrics. Each one must be defensible in an interview — if you
 * can't explain how it was measured, remove it.
 */
export const metrics = [
  { value: '90%', label: 'fewer deployment failures', detail: 'via automation and custom tooling' },
  { value: '60%', label: 'faster pipeline execution', detail: 'Airflow DAG optimisation' },
  { value: '10+', label: 'engineering teams supported', detail: 'internal platform tooling' },
  { value: '1', label: 'granted patent', detail: 'Government of India, 2024' },
] as const

export const experience = [
  {
    company: 'Apple AdPlatforms',
    via: 'Quest Global',
    role: 'Platform Engineer',
    // TODO: add start date — not recorded anywhere in the repos.
    period: 'Current',
    summary:
      'Orchestrate thousands of Airflow DAGs supporting 10+ engineering teams. Cut deployment failures by 90% and pipeline execution time by 60% through automation and internal tooling.',
    stack: ['Java', 'Spring Boot', 'Apache Airflow', 'Kubernetes', 'Docker', 'Jenkins'],
  },
] as const

export const certifications = [
  { name: 'AWS Certified', issuer: 'Amazon Web Services' },
  { name: 'OCI Certified', issuer: 'Oracle Cloud Infrastructure' },
] as const

export const patent = {
  title: 'A System for Solar Energy Production Using PLC',
  number: '551111',
  filed: 'December 2022',
  granted: 'September 2024',
  authority: 'Government of India',
  url: 'https://ycce.edu/wp-content/uploads/2025/01/107_202221077674.pdf',
  summary:
    'Optimises solar energy output using Programmable Logic Controllers and IoT sensors, automating panel adjustment against the sun’s position.',
} as const

/** Observability and infra tools, grouped for the stack section. */
export const stack = {
  languages: ['Java', 'TypeScript', 'SQL', 'Bash'],
  frameworks: ['Spring Boot', 'React', 'JPA / Hibernate', 'Flyway'],
  infra: ['Docker', 'Kubernetes', 'Jenkins', 'Apache Airflow', 'nginx', 'Terraform'],
  data: ['PostgreSQL', 'Redis'],
  observability: ['OpenTelemetry', 'Grafana', 'Datadog'],
  cloud: ['AWS', 'Oracle Cloud (OCI)', 'GCP'],
} as const

/**
 * The stack, regrouped by CAPABILITY rather than by category.
 *
 * "Languages / Frameworks / Infrastructure" is a taxonomy of tools, and a
 * taxonomy of tools tells a reader nothing a CV wouldn't. Grouping by what the
 * tools let you *do*, with one line on what each grouping actually bought, is
 * the difference between listing technologies and demonstrating capability.
 *
 * Every tool named here also appears in `stack` above — this is a re-cut of the
 * same set, not an expansion of it. `buys` lines are drawn from work that
 * actually happened and appears in the project write-ups; none is aspirational.
 */
export const capabilities = [
  {
    label: 'Ship services',
    tools: ['Java', 'Spring Boot', 'JPA / Hibernate', 'Flyway'],
    buys:
      'Versioned migrations that run before the application context starts, with baseline-on-migrate so a database predating version control gets adopted rather than dropped.',
  },
  {
    label: 'Schedule the work',
    tools: ['Apache Airflow', 'Jenkins', 'Bash'],
    buys:
      'Thousands of DAGs across ten-plus teams. Most of the job is making a dependency graph fail loudly at the right step instead of quietly at 4am.',
  },
  {
    label: 'Run it anywhere',
    tools: ['Docker', 'Kubernetes', 'nginx', 'Terraform', 'AWS', 'Oracle Cloud (OCI)', 'GCP'],
    buys:
      'Least-privilege containers, TLS renewed on a timer, rate limiting at the edge — and the judgement to run six containers on Compose rather than stand up a control plane for them.',
  },
  {
    label: 'Store the state',
    tools: ['PostgreSQL', 'Redis', 'SQL'],
    buys:
      'Advisory locks scoped to one invariant instead of a SERIALIZABLE transaction over everything, and a cache that stores failures too so a broken upstream is not also a latency regression.',
  },
  {
    label: 'See inside it',
    tools: ['OpenTelemetry', 'Grafana', 'Datadog'],
    buys:
      'Single-line JSON correlated by request ID, so a user can quote an ID from a response header and one grep finds their request. No log shipper required.',
  },
  {
    label: 'Build the surface',
    tools: ['TypeScript', 'React'],
    buys:
      'This page. Backend and platform is where I am strongest, and I would rather write that down than pretend otherwise.',
  },
] as const
