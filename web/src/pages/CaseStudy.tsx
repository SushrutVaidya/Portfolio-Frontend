import { useEffect, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Frame, Grid, Marker, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { CountUp } from '@/components/CountUp'
import { projects } from '@/content/projects'
import { profile } from '@/content/site'

/**
 * Case study — /work/:slug.
 *
 * Built on the same Frame/Grid primitives as the home page, which is the point:
 * the previous version of this route was a centred `max-w-5xl` column, so
 * following a link from a composed page landed you in a document. Same geometry
 * and margins; only the accent changes.
 *
 * The project owns the accent for the whole route. It is applied to a wrapper
 * element rather than to documentElement: writing it to :root leaked the palette
 * into everything mounted outside this route, which on an earlier build turned
 * the shared footer unreadable. Custom properties inherit, so scoping them here
 * themes the case study completely and leaks nothing.
 *
 * Structure is long-form on purpose. A recruiter reads the masthead and the
 * numbers; an engineer reads the narrative and the decisions. Neither is served
 * by collapsing the interesting parts behind accordion triggers, which is what
 * this used to do.
 */
export function CaseStudy() {
  const { slug } = useParams<{ slug: string }>()
  const project = projects.find((p) => p.slug === slug)

  useEffect(() => {
    if (!project) return
    document.title = `${project.name} · ${profile.name}`
    return () => {
      document.title = `${profile.name} · ${profile.role}`
    }
  }, [project])

  if (!project) return <NotFound slug={slug} />

  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(index + 1) % projects.length]
  const ordinal = String(index + 1).padStart(2, '0')
  const external = project.href?.startsWith('http')

  // The project's hue drives the whole route: --accent for links/markers, and a
  // soft tint wash on the masthead so each case study is unmistakably its own
  // colour (loglens green, Forge purple, DevQuest yellow), the way the home
  // cards are. Ground, ink and type scale stay put; only colour changes.
  const hue = `var(--color-${project.hue})`
  const accent = {
    '--accent': `var(--color-${project.hue})`,
  } as CSSProperties

  return (
    <div style={accent}>
      <main>
        {/* ─── Masthead ──────────────────────────────────────────── */}
        <Frame
          full
          aria-labelledby="study-title"
          style={{ backgroundColor: `color-mix(in oklab, ${hue} 8%, var(--color-paper))` }}
        >
          <Grid>
            <div className={`${col.rail} hidden lg:block`}>
              <span
                aria-hidden="true"
                className="t-mega block font-display font-extrabold"
                style={{ color: hue }}
              >
                {ordinal}
              </span>
            </div>

            <div className={col.main}>
              <Link to="/" className="t-label rule-in">
                ← All work
              </Link>

              {/* t-display, not t-mega: one of these titles is 33 characters
                  long, and at mega scale it would set as four full-height
                  lines. The ordinal in the rail carries the scale instead. */}
              <h1 id="study-title" className="t-display mt-8">
                {project.name}
              </h1>

              <p className="t-sub mt-7 max-w-2xl font-display italic">{project.tagline}</p>

              <p className="t-body mt-8 max-w-xl text-ink-muted">{project.summary}</p>

              <dl className="mt-14 flex flex-wrap gap-x-14 gap-y-7 border-t-2 border-line-strong pt-8">
                {[
                  ['Year', project.year],
                  ['Role', project.role],
                  ['Status', project.status],
                ].map(([key, value]) => (
                  <div key={key}>
                    <dt className="t-label">{key}</dt>
                    <dd className="t-body mt-2 font-display font-bold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-4">
                {project.href &&
                  (external ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-pop"
                      style={{ backgroundColor: hue, color: '#fff' }}
                    >
                      {project.status === 'live' ? 'Open it' : 'Read the filing'}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    // Internal href (loglens product page): client-route, no reload.
                    <Link
                      to={project.href}
                      className="btn-pop"
                      style={{ backgroundColor: hue, color: '#fff' }}
                    >
                      {project.status === 'live' ? 'Open it' : 'Read the filing'}
                      <span aria-hidden="true">→</span>
                    </Link>
                  ))}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-pop bg-paper-raised"
                  >
                    Source ↗
                  </a>
                )}
              </div>
            </div>
          </Grid>
        </Frame>

        {/* ─── Numbers ───────────────────────────────────────────── */}
        {project.metrics && (
          <Frame
            rule
            aria-label="Numbers"
            style={{ backgroundColor: `color-mix(in oklab, ${hue} 6%, var(--color-paper))` }}
          >            <Grid>
              <dl className={`${col.full} grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4`}>
                {project.metrics.map((metric, i) => (
                  <Reveal key={metric.label} delay={i * 0.06}>
                    <div className="border-t-2 border-line-strong pt-6">
                      <dt className="sr-only">{metric.label}</dt>
                      <dd>
                        <span className="t-display block tabular-nums" style={{ color: hue }}>
                          <CountUp value={metric.value} />
                        </span>
                        <span className="t-label mt-4 block max-w-[20ch]">{metric.label}</span>
                      </dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </Grid>
          </Frame>
        )}

        {/* ─── Narrative ─────────────────────────────────────────── */}
        {project.study && (
          <Frame rule aria-labelledby="study-narrative">
            <Grid>
              <div className={col.full}>
                {/* Letters, not numbers: the home page owns 01-06, and a
                    second numeric sequence inside a chapter of it would read as
                    a numbering bug rather than a sub-section. */}
                <Marker index="A" label="how it was built" />
              </div>

              {/* Sticky contents rail. On a page this long the reader loses
                  track of where they are, and a fixed list of the blocks is a
                  cheaper orientation cue than a progress ring. */}
              <div className={`${col.rail} mt-14 lg:sticky lg:top-24 lg:self-start`}>
                <h2 id="study-narrative" className="t-heading">
                  How it was built
                </h2>
                <ol className="mt-8 hidden space-y-3 lg:block">
                  {project.study.map((block, i) => (
                    <li key={block.index} className="t-label">
                      <span className="text-accent">A.{i + 1}</span>
                      <span className="mx-2 text-ink-faint">/</span>
                      {block.heading}
                    </li>
                  ))}
                </ol>
              </div>

              <div className={`${col.main} mt-14 space-y-20`}>
                {project.study.map((block, i) => (
                  <Reveal key={block.index}>
                    <article>
                      <div className="flex items-baseline gap-5">
                        <span aria-hidden="true" className="t-label shrink-0 text-accent">
                          A.{i + 1}
                        </span>
                        <h3 className="t-heading">{block.heading}</h3>
                      </div>
                      <p className="t-body mt-6 max-w-xl text-ink-muted lg:pl-12">
                        {block.body}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </Grid>
          </Frame>
        )}

        {/* ─── Decisions ─────────────────────────────────────────── */}
        <Frame rule tone="deep" aria-labelledby="study-decisions">
          <Grid>
            <div className={col.full}>
              <Marker index="B" label="decisions & trade-offs" />
            </div>

            <div className={`${col.rail} mt-14`}>
              <h2 id="study-decisions" className="t-heading">
                Decisions &amp; trade-offs
              </h2>
              <p className="t-body mt-6 max-w-[26ch] text-ink-muted">
                Each states what was chosen and why the alternative was rejected.
              </p>
            </div>

            {/* Rendered open, not behind accordion triggers. This is the part an
                engineer came for; making them click six times to read it is
                optimising the page for the reader who was never going to. */}
            <ul className={`${col.main} mt-14 border-t border-line`}>
              {project.highlights.map((highlight, i) => (
                // Reveal inside the li: it renders a div, and <ul><div> is
                // invalid markup that silently costs the list its semantics.
                <li key={highlight.title} className="border-b border-line py-8">
                  <Reveal delay={i * 0.03}>
                    <div className="flex items-baseline gap-5">
                      <span aria-hidden="true" className="t-label shrink-0 text-accent">
                        B.{i + 1}
                      </span>
                      <h3 className="t-heading">{highlight.title}</h3>
                    </div>
                    <p className="t-body mt-4 max-w-xl text-ink-muted lg:pl-12">
                      {highlight.detail}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ul>

            <div className={`${col.full} mt-16`}>
              <h3 className="t-label">Full stack</h3>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1" aria-label="Full stack">
                {project.stack.map((tech) => (
                  <li key={tech} className="t-label">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </Grid>
        </Frame>

        {/* ─── Next ──────────────────────────────────────────────── */}
        <Frame rule aria-label="Next project">
          <Grid>
            <div className={col.full}>
              <Link to={`/work/${next.slug}`} className="group/next block">
                <span className="t-label">Next</span>
                <span className="t-display mt-5 block transition-transform duration-[var(--dur-base)] group-hover/next:translate-x-3">
                  {next.name} →
                </span>
                <span className="t-sub mt-4 block font-display italic">{next.tagline}</span>
              </Link>
            </div>

            <p className={`${col.full} t-label mt-16`}>
              © {new Date().getFullYear()} {profile.name}
            </p>
          </Grid>
        </Frame>
      </main>
    </div>
  )
}

/**
 * Unknown slug, and the catch-all route.
 *
 * Kept deliberately plain and in the site's own register — a joke 404 on a
 * portfolio is a page that wastes the one interaction a lost reader has left.
 */
export function NotFound({ slug }: { slug?: string }) {
  useEffect(() => {
    document.title = `Not found · ${profile.name}`
    return () => {
      document.title = `${profile.name} · ${profile.role}`
    }
  }, [])

  return (
    <main>
      <Frame full aria-labelledby="notfound-heading">
        <Grid>
          <div className={col.main}>
            <span className="t-label text-accent">404</span>
            <h1 id="notfound-heading" className="t-display mt-4">
              Nothing here.
            </h1>
            <p className="t-sub mt-8 max-w-md">
              {slug ? (
                <>
                  No project matches <span className="font-mono text-ink">{slug}</span>.
                </>
              ) : (
                'That address does not resolve to anything on this site.'
              )}
            </p>
            <Link to="/" className="t-sub rule-in mt-12 inline-block text-ink">
              ← Back to the start
            </Link>
          </div>
        </Grid>
      </Frame>
    </main>
  )
}
