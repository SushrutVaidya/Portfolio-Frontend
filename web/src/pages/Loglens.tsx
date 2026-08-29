import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Frame, Grid } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { LoglensDemo } from '@/components/LoglensDemo'
import { SiteLink } from '@/components/SiteLink'
import { DUR, EASE } from '@/lib/motion'

/**
 * loglens, the product page.
 *
 * A dedicated launch page at /loglens, styled like a real product unveiling but
 * in the portfolio's own language: cream ground, chunky Bricolage display,
 * sticker cards, and loglens's green as the accent throughout (scoped via
 * --accent on the wrapper). Everything here is true to the tool: the copy comes
 * from the README, the demo is the real ported core running live, and the three
 * GIFs are the actual asciinema recordings. No invented features, no fake
 * screenshots.
 */

const REPO = 'https://github.com/SushrutVaidya/loglens'

const RAW_LINE =
  '{"timestamp":"2026-08-15T10:22:03.010Z","level":"error","trace_id":"7b0e-c3","message":"query failed: timeout","sql":"SELECT ..."}'
const PRETTY_PARTS = [
  { t: '10:22:03', c: 'var(--color-ink-faint)' },
  { t: 'ERROR', c: 'var(--color-red)' },
  { t: 'query failed: timeout', c: '#e9e6dd' },
  { t: 'req=7b0e-c3', c: 'var(--color-blue)' },
  { t: 'sql=SELECT ...', c: 'var(--color-ink-faint)' },
]

const FEATURES = [
  {
    flag: '--stats',
    title: 'Triage, not a scroll',
    body: 'A summary instead of ten thousand lines. Near-identical messages collapse by template, so 400 timeouts become one finding with a count. Counts by level and source, and when errors peaked.',
    hue: 'green',
  },
  {
    flag: '--trace <id>',
    title: 'Follow one request',
    body: 'Show only the lines for a correlation id and highlight it. Auto-detects the usual fields (requestId, X-Request-Id, traceId). Stack traces stay attached to the entry that threw them.',
    hue: 'blue',
  },
  {
    flag: 'pretty-print',
    title: 'Readable by default',
    body: 'JSON, logfmt and klog render as one scannable line: time, level, message, then key=val, colour-coded by severity. No config, no schema.',
    hue: 'yellow',
  },
  {
    flag: '--level / --where / --grep',
    title: 'Filter fast',
    body: 'A minimum severity threshold, exact field matches (repeatable, AND-ed), or a plain substring on the raw line. Compose them.',
    hue: 'purple',
  },
  {
    flag: 'one stream',
    title: 'Every format at once',
    body: 'Your service JSON next to the control-plane klog next to an ingress logfmt line, all rendered uniformly in a single pass. It strips kubectl and docker-compose prefixes too.',
    hue: 'red',
  },
  {
    flag: 'streaming',
    title: 'Well-behaved in a pipe',
    body: 'Reads line by line and never buffers, so kubectl logs -f goes straight in. Drops colour when piped, honours NO_COLOR, and passes anything it cannot parse through untouched.',
    hue: 'green',
  },
] as const

// The ordered fall-through chain, from the parser source. First matcher wins.
const CHAIN = [
  'strip prefix',
  'continuation?',
  'JSON',
  'Airflow',
  'klog',
  'Python',
  'log4j',
  'logfmt',
  'generic',
] as const

const FORMATS = [
  'JSON lines',
  'logfmt',
  'klog',
  'Airflow',
  'Spark / Hadoop',
  'Kafka / Hive / Flink (log4j)',
  'Python logging',
  'JVM stack traces',
  'kubectl / compose prefixes',
  'generic timestamp + level',
] as const

const SHOWCASE = [
  {
    src: '/img/loglens-stats.gif',
    flag: '--stats',
    title: 'Eight errors, three real problems',
    body: 'The question at 3am is not "show me the lines", it is "what is the shape of this". --stats answers it: distinct problems with counts, not a wall to scroll.',
  },
  {
    src: '/img/loglens-trace.gif',
    flag: '--trace',
    title: 'One request, end to end',
    body: 'Given a correlation id, the whole incident is legible in five lines: cache miss, pool exhausted, timeout, 500, then a 200 after recovery. Stack traces stay put.',
  },
  {
    src: '/img/loglens-multiformat.gif',
    flag: 'multi-format',
    title: 'One stream, many dialects',
    body: 'A real kubectl logs is not one tidy format. loglens renders your app, the control plane and the ingress in the same shape, interleaved, in one pass.',
  },
] as const

const HUE = (h: string) => `var(--color-${h})`
const tint = (h: string) => `color-mix(in oklab, ${HUE(h)} 12%, white)`

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1600)
          },
          () => {}
        )
      }}
      className="t-label rounded-full border-2 border-line-strong bg-paper-raised px-3 py-1 text-ink transition-colors hover:bg-paper"
    >
      {copied ? 'copied' : 'copy'}
    </button>
  )
}

/** A terminal-chrome card: dots, a title, then children on a dark ground. */
function Terminal({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="card-pop overflow-hidden bg-paper-raised">
      <div className="flex items-center gap-2.5 border-b-2 border-line-strong px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full border border-line-strong bg-red" />
          <span className="h-3 w-3 rounded-full border border-line-strong bg-yellow" />
          <span className="h-3 w-3 rounded-full border border-line-strong bg-green" />
        </span>
        <span className="t-label text-ink">{title}</span>
        {action && <span className="ml-auto">{action}</span>}
      </div>
      <div className="bg-paper-deep p-4 font-mono text-[0.82rem] leading-relaxed" style={{ color: '#e9e6dd' }}>
        {children}
      </div>
    </div>
  )
}

function SectionLabel({ children, hue = 'green' }: { children: ReactNode; hue?: string }) {
  return (
    <span className="t-label" style={{ color: HUE(hue) }}>
      {children}
    </span>
  )
}

export function Loglens() {
  const reduce = useReducedMotion()
  const green = { '--accent': 'var(--color-green)' } as CSSProperties

  // SEO: while the loglens page is mounted, swap the document head to loglens-
  // specific metadata (title, description, canonical → the subdomain, OG/Twitter,
  // and a SoftwareApplication JSON-LD). Canonical resolves the duplicate-content
  // problem between /loglens and loglens.sushrutvaidya.in. Everything is restored
  // on unmount so the portfolio's own meta returns on other routes.
  useEffect(() => {
    const CANON = 'https://loglens.sushrutvaidya.in/'
    const TITLE = 'loglens · readable logs in the terminal'
    const DESC =
      'A fast Java CLI that makes structured logs (JSON, logfmt, klog) legible in the terminal: pretty-print, follow one request by trace id, and a --stats triage view. Open source, Apache-2.0.'
    const IMG = 'https://loglens.sushrutvaidya.in/img/loglens-stats.gif'

    const undo: Array<() => void> = []
    const setMeta = (attr: 'name' | 'property', key: string, val: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
      if (el) {
        const old = el.getAttribute('content') ?? ''
        const ref = el
        undo.push(() => ref.setAttribute('content', old))
      } else {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
        const ref = el
        undo.push(() => ref.remove())
      }
      el.setAttribute('content', val)
    }
    const setCanonical = (href: string) => {
      let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (el) {
        const old = el.getAttribute('href') ?? ''
        const ref = el
        undo.push(() => ref.setAttribute('href', old))
      } else {
        el = document.createElement('link')
        el.setAttribute('rel', 'canonical')
        document.head.appendChild(el)
        const ref = el
        undo.push(() => ref.remove())
      }
      el.setAttribute('href', href)
    }

    const prevTitle = document.title
    document.title = TITLE
    setCanonical(CANON)
    setMeta('name', 'description', DESC)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', CANON)
    setMeta('property', 'og:title', TITLE)
    setMeta('property', 'og:description', DESC)
    setMeta('property', 'og:image', IMG)
    setMeta('name', 'twitter:title', TITLE)
    setMeta('name', 'twitter:description', DESC)
    setMeta('name', 'twitter:image', IMG)

    // Only inject JSON-LD if the shell didn't already bake one in: loglens.html
    // (the subdomain shell) ships a static SoftwareApplication, while the apex
    // index.html ships a Person node, so there we add ours. Prevents a duplicate
    // SoftwareApplication when the loglens page renders on the subdomain shell.
    const hasSoftwareLd = Array.from(
      document.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    ).some((s) => (s.textContent ?? '').includes('SoftwareApplication'))
    let ld: HTMLScriptElement | null = null
    if (!hasSoftwareLd) {
      ld = document.createElement('script')
      ld.type = 'application/ld+json'
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'loglens',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Linux, macOS, Windows',
        description: DESC,
        url: CANON,
        softwareLicense: 'https://www.apache.org/licenses/LICENSE-2.0',
        author: { '@type': 'Person', name: 'Sushrut Vaidya', url: 'https://sushrutvaidya.in/' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        sameAs: ['https://github.com/SushrutVaidya/loglens'],
      })
      document.head.appendChild(ld)
    }

    return () => {
      document.title = prevTitle
      undo.reverse().forEach((fn) => fn())
      ld?.remove()
    }
  }, [])

  return (
    <div style={green}>
      <main>
        {/* ═══ HERO ═══ */}
        <Frame full aria-labelledby="ll-hero">
          <Grid className="items-center">
            <div className="col-span-4 lg:col-span-6">
              <SiteLink to="/#work" className="t-label rule-in">
                ← Back to work
              </SiteLink>

              <div className="mt-8 mb-6 inline-flex items-center gap-2.5 rounded-full border-2 border-line-strong bg-paper-raised px-4 py-1.5">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-green" />
                <span className="t-label text-ink">Open source · Apache 2.0 · Java 21</span>
              </div>

              <h1 id="ll-hero" className="t-mega" style={{ color: HUE('green') }}>
                loglens
              </h1>
              <p className="t-display mt-2">Readable logs in the terminal.</p>
              <p className="t-sub mt-6 max-w-xl">
                Pretty-print, filter, trace and summarise structured logs. No agent, no backend,
                no change to the app producing them. Just pipe.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href={REPO}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-pop bg-green"
                  style={{ color: '#06210f' }}
                >
                  View on GitHub
                  <span aria-hidden="true">↗</span>
                </a>
                <a href="#demo" className="btn-pop bg-paper-raised">
                  Try it live
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>

            {/* Hero terminal: the signature pipe, and the before/after in one. */}
            <motion.div
              className="col-span-4 lg:col-span-6"
              initial={reduce ? undefined : { opacity: 0, y: 24 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: DUR.smooth, ease: EASE, delay: 0.15 }}
            >
              <Terminal title="kubectl logs -f api | loglens">
                <div className="space-y-3">
                  <div>
                    <div className="text-[0.7rem]" style={{ color: 'var(--color-ink-faint)' }}>
                      # what your service emits
                    </div>
                    <div className="mt-1 break-all opacity-70">{RAW_LINE}</div>
                  </div>
                  <div>
                    <div className="text-[0.7rem]" style={{ color: HUE('green') }}>
                      # what you read
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {PRETTY_PARTS.map((p) => (
                        <span key={p.t} style={{ color: p.c }}>
                          {p.t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Terminal>
            </motion.div>
          </Grid>
        </Frame>

        {/* ═══ THE PROBLEM ═══ */}
        <Frame rule aria-labelledby="ll-problem">
          <Grid>
            <div className="col-span-4 lg:col-span-10 lg:col-start-2">
              <SectionLabel>The problem</SectionLabel>
              <h2 id="ll-problem" className="t-display mt-4">
                Structured logging is great for machines
                <br />
                and <span style={{ color: HUE('red') }}>hostile to humans</span>.
              </h2>
              <p className="t-sub mt-6 max-w-2xl">
                JSON logs are perfect for a log store and miserable to read at 3am. Debugging a
                single request means grepping one id out of thousands of lines and squinting at
                braces. loglens is that workflow as one flag.
              </p>
            </div>
          </Grid>
        </Frame>

        {/* ═══ LIVE DEMO ═══ */}
        <Frame
          rule
          id="demo"
          aria-labelledby="ll-demo"
          style={{ backgroundColor: tint('green') }}
        >
          <Grid>
            <div className="col-span-4 lg:col-span-12">
              <SectionLabel>Try it, right here</SectionLabel>
              <h2 id="ll-demo" className="t-display mt-4">
                The actual tool, running in your browser.
              </h2>
              <p className="t-sub mt-6 max-w-2xl">
                This is loglens&apos;s real parser and templating, ported to TypeScript. Flip to
                <span className="font-mono"> --stats</span> and watch four Postgres timeouts, each
                with a different IP and duration, collapse into one finding. Paste your own logs at
                the bottom.
              </p>
              <div className="mt-8">
                <LoglensDemo />
              </div>
            </div>
          </Grid>
        </Frame>

        {/* ═══ FEATURES ═══ */}
        <Frame rule aria-labelledby="ll-features">
          <Grid>
            <div className="col-span-4 lg:col-span-12">
              <SectionLabel>What it does</SectionLabel>
              <h2 id="ll-features" className="t-display mt-4">
                Six flags that do the work.
              </h2>
            </div>
          </Grid>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="card-pop h-full p-6" style={{ backgroundColor: tint(f.hue) }}>
                  <code
                    className="font-mono inline-block rounded-full border-2 border-line-strong bg-paper-raised px-3 py-1 text-[0.75rem] font-semibold"
                    style={{ color: HUE(f.hue) }}
                  >
                    {f.flag}
                  </code>
                  <h3 className="t-heading mt-4">{f.title}</h3>
                  <p className="t-body mt-3 text-ink-muted">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Frame>

        {/* ═══ SHOWCASE (real GIFs) ═══ */}
        <Frame rule aria-labelledby="ll-showcase" style={{ backgroundColor: tint('blue') }}>
          <Grid>
            <div className="col-span-4 lg:col-span-12">
              <SectionLabel hue="blue">In motion</SectionLabel>
              <h2 id="ll-showcase" className="t-display mt-4">
                Three moments that sell it.
              </h2>
            </div>
          </Grid>

          <div className="mt-12 flex flex-col gap-16">
            {SHOWCASE.map((s, i) => (
              <Reveal key={s.title}>
                <div
                  className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 ${
                    i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <div className="card-pop overflow-hidden border-line-strong bg-paper-deep">
                    <img
                      src={s.src}
                      alt={`loglens ${s.flag} demo`}
                      loading="lazy"
                      decoding="async"
                      width={1452}
                      height={781}
                      className="block h-auto w-full object-contain"
                    />
                  </div>
                  <div>
                    <code
                      className="font-mono inline-block rounded-full border-2 border-line-strong bg-paper-raised px-3 py-1 text-[0.75rem] font-semibold"
                      style={{ color: HUE('blue') }}
                    >
                      {s.flag}
                    </code>
                    <h3 className="t-heading mt-4">{s.title}</h3>
                    <p className="t-sub mt-3">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Frame>

        {/* ═══ HOW IT WORKS ═══ */}
        <Frame rule aria-labelledby="ll-how">
          <Grid>
            <div className="col-span-4 lg:col-span-5">
              <SectionLabel hue="purple">How it works</SectionLabel>
              <h2 id="ll-how" className="t-display mt-4">
                One ordered chain. First matcher wins.
              </h2>
              <p className="t-sub mt-6">
                No <span className="font-mono">--format</span> to guess. Every line runs the same
                fall-through pipeline, most specific first, down to a generic timestamp-and-level
                fallback. Get the order right and a mixed stream just works.
              </p>
              <p className="t-body mt-6 text-ink-muted">
                Continuation lines (a Java stack trace) inherit their parent&apos;s keep-or-drop
                decision, with no lookahead, so filters never orphan a trace and the tool still
                streams.
              </p>
            </div>

            <div className="col-span-4 lg:col-span-6 lg:col-start-7">
              <ol className="flex flex-col gap-2">
                {CHAIN.map((step, i) => (
                  <Reveal key={step} delay={i * 0.04}>
                    <li className="card-pop flex items-center gap-4 bg-paper-raised px-5 py-3">
                      <span
                        className="font-mono text-[0.75rem] font-semibold tabular-nums"
                        style={{ color: HUE('purple') }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-display font-bold text-ink">{step}</span>
                      {i < CHAIN.length - 1 && (
                        <span aria-hidden="true" className="t-label ml-auto">
                          then ↓
                        </span>
                      )}
                      {i === CHAIN.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="t-label ml-auto"
                          style={{ color: HUE('green') }}
                        >
                          catch-all
                        </span>
                      )}
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </Grid>
        </Frame>

        {/* ═══ FORMATS ═══ */}
        <Frame rule aria-labelledby="ll-formats" style={{ backgroundColor: tint('yellow') }}>
          <Grid>
            <div className="col-span-4 lg:col-span-12">
              <SectionLabel hue="yellow">Format support</SectionLabel>
              <h2 id="ll-formats" className="t-display mt-4">
                It already reads what you run.
              </h2>
            </div>
          </Grid>
          <ul className="mt-10 flex flex-wrap gap-3">
            {FORMATS.map((f) => (
              <li
                key={f}
                className="card-pop bg-paper-raised px-4 py-2 font-display font-bold text-ink"
              >
                {f}
              </li>
            ))}
          </ul>
        </Frame>

        {/* ═══ INSTALL ═══ */}
        <Frame rule aria-labelledby="ll-install">
          <Grid>
            <div className="col-span-4 lg:col-span-5">
              <SectionLabel>Get started</SectionLabel>
              <h2 id="ll-install" className="t-display mt-4">
                Clone, build, pipe.
              </h2>
              <p className="t-sub mt-6">
                It builds to a single jar with Maven, or a native binary via the GraalVM profile.
                Then it lives on your box, where the fastest tool during an incident always is.
              </p>
            </div>

            <div className="col-span-4 lg:col-span-6 lg:col-start-7">
              <Terminal
                title="install.sh"
                action={
                  <CopyButton text={'git clone https://github.com/SushrutVaidya/loglens\ncd loglens && mvn -q package\nkubectl logs -f api | java -jar target/loglens.jar --stats'} />
                }
              >
                <div className="space-y-1">
                  <div>
                    <span style={{ color: HUE('green') }}>$</span> git clone github.com/SushrutVaidya/loglens
                  </div>
                  <div>
                    <span style={{ color: HUE('green') }}>$</span> cd loglens &amp;&amp; mvn -q package
                  </div>
                  <div className="opacity-60">  building loglens.jar ...</div>
                  <div className="pt-2">
                    <span style={{ color: HUE('green') }}>$</span> kubectl logs -f api | java -jar
                    target/loglens.jar --stats
                  </div>
                </div>
              </Terminal>
              <p className="t-label mt-4">
                Tip: alias loglens=&apos;java -jar /path/to/loglens.jar&apos; and forget the jar exists.
              </p>
            </div>
          </Grid>
        </Frame>

        {/* ═══ NUMBERS + CTA ═══ */}
        <Frame rule tone="deep" aria-label="loglens by the numbers">
          <Grid>
            <dl className="col-span-4 grid grid-cols-2 gap-x-8 gap-y-12 lg:col-span-12 lg:grid-cols-4">
              {[
                ['44', 'tests, all passing'],
                ['10', 'formats, one stream'],
                ['0', 'agents or backends'],
                ['1', 'binary, no runtime deps'],
              ].map(([value, label]) => (
                <div key={label} className="border-t-2 border-line-strong pt-6">
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span
                      className="font-display block text-6xl font-extrabold tabular-nums"
                      style={{ color: HUE('green') }}
                    >
                      {value}
                    </span>
                    <span className="t-label mt-3 block">{label}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="col-span-4 mt-16 lg:col-span-12">
              <h2 className="t-display max-w-3xl">
                Stop scrolling logs.
                <br />
                <span style={{ color: HUE('green') }}>Start reading them.</span>
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={REPO}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-pop bg-green"
                  style={{ color: '#06210f' }}
                >
                  Star it on GitHub
                  <span aria-hidden="true">↗</span>
                </a>
                <SiteLink to="/work/loglens" className="btn-pop bg-paper-raised">
                  Read the write-up
                  <span aria-hidden="true">→</span>
                </SiteLink>
              </div>
              <p className="t-label mt-10">loglens · Apache 2.0 · built by Sushrut Vaidya</p>
            </div>
          </Grid>
        </Frame>
      </main>
    </div>
  )
}
