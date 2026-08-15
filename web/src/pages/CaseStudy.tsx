import { useEffect, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Reveal } from '@/components/Reveal'
import { Pinned } from '@/components/Pinned'
import { SplitText } from '@/components/SplitText'
import { CountUp } from '@/components/CountUp'
import { projects } from '@/content/projects'
import { contrastInk } from '@/lib/color'

/**
 * Case study route — /work/:slug.
 *
 * The project owns the entire page: its palette is applied to a wrapper element
 * so headings, rules and buttons all recolour — the approach david-hckh.com
 * takes with its .project-* classes. Scoped rather than global, so it cannot
 * leak into the shared footer.
 *
 * Structure is deliberately long-form: masthead, then narrative blocks, then
 * the engineering decisions. A recruiter reads the masthead and outcome; an
 * engineer reads the rest.
 */
export function CaseStudy() {
  const { slug } = useParams<{ slug: string }>()
  const project = projects.find((p) => p.slug === slug)
  const reduceMotion = useReducedMotion()

  // Scroll progress bar — cheap orientation cue on a long page.
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  useEffect(() => {
    if (project) document.title = `${project.name} — Sushrut Vaidya`
    return () => {
      document.title = 'Sushrut Vaidya — Platform Engineer & Developer'
    }
  }, [project])

  if (!project) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl">Nothing here</h1>
        <p className="font-mono text-sm text-muted-foreground">
          No project matches “{slug}”.
        </p>
        <Link
          to="/"
          className="lift font-display border border-line bg-accent px-5 py-2 text-accent-ink shadow-md"
        >
          ← Back
        </Link>
      </main>
    )
  }

  /**
   * Theme is scoped to this wrapper, NOT documentElement.
   *
   * Writing --foreground/--background to :root leaked the project palette into
   * the Footer, which renders outside this route but in the same tree — cream
   * ink landed on tan paper and the whole footer became unreadable. Custom
   * properties inherit, so scoping them here themes the case study completely
   * while leaving everything outside it alone.
   */
  const themeVars = {
    '--accent': project.theme.accent,
    '--accent-ink': contrastInk(project.theme.accent),
    '--foreground': project.theme.ink,
    '--background': project.theme.stock,
  } as CSSProperties

  return (
    <div style={themeVars} className="bg-background text-foreground">
      {!reduceMotion && (
        <motion.div
          className="fixed top-0 left-0 z-100 h-1 w-full origin-left bg-accent"
          style={{ scaleX: progress }}
          aria-hidden="true"
        />
      )}

      <main className="min-h-dvh">
        {/* Masthead */}
        <header className="border-b border-line px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-5xl">
            <Link
              to="/"
              className="font-mono inline-block text-xs underline decoration-2 underline-offset-4 hover:bg-accent hover:text-black "
            >
              ← All work
            </Link>

            <h1 className="mt-8 text-[clamp(2.5rem,9vw,7rem)] leading-[0.85]">
              <SplitText immediate delay={0.15}>
                {project.name}
              </SplitText>
            </h1>

            <p className="mt-6 max-w-2xl text-lg md:text-2xl">{project.tagline}</p>

            <dl className="font-mono mt-12 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[0.65rem] uppercase opacity-60">Year</dt>
                <dd className="mt-1">{project.year}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase opacity-60">Role</dt>
                <dd className="mt-1">{project.role}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase opacity-60">Status</dt>
                <dd className="mt-1 capitalize">{project.status}</dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              {project.href && (
                <a
                  href={project.href}
                  target={project.href.startsWith('http') ? '_blank' : undefined}
                  rel={project.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                  className="lift font-display border border-line bg-accent px-5 py-2.5 text-sm text-accent-ink shadow-md "
                >
                  {project.status === 'live' ? 'Open it' : 'Read the filing'} →
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="lift font-display border border-line px-5 py-2.5 text-sm shadow-md "
                >
                  Source ↗
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Metrics band */}
        {project.metrics && (
          <div className="border-b border-line px-6 py-10 md:px-12">
            <dl className="mx-auto flex max-w-5xl flex-wrap gap-x-16 gap-y-6">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <span className="font-display block text-4xl tabular-nums md:text-6xl">
                      <CountUp value={m.value} />
                    </span>
                    <span className="font-mono mt-1 block text-xs opacity-70">{m.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Narrative — pinned heading, scrolling body */}
        {project.study && (
          <section
            aria-label="Case study"
            className="border-b border-line px-6 py-20 md:px-12 md:py-28"
          >
            <div className="mx-auto max-w-6xl">
              <Pinned
                aside={
                  <div>
                    <p className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-accent">
                      The write-up
                    </p>
                    <h2 className="mt-4 text-3xl leading-[0.95] md:text-5xl">
                      How it was built
                    </h2>
                    <ul className="font-mono mt-8 hidden space-y-2 text-xs md:block">
                      {project.study.map((b) => (
                        <li key={b.index} className="opacity-60">
                          {b.index} · {b.heading}
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              >
                <div className="space-y-14">
                  {project.study.map((block) => (
                    <Reveal key={block.index}>
                      <article>
                        <div className="flex items-baseline gap-4">
                          <span
                            aria-hidden="true"
                            className="font-mono shrink-0 text-xs text-accent"
                          >
                            {block.index}
                          </span>
                          <h3 className="text-xl leading-tight md:text-3xl">{block.heading}</h3>
                        </div>
                        <p className="mt-4 max-w-prose leading-relaxed opacity-90 md:pl-10">
                          {block.body}
                        </p>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </Pinned>
            </div>
          </section>
        )}

        {/* Engineering decisions */}
        <section aria-label="Engineering decisions" className="px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="text-2xl md:text-4xl">Decisions &amp; trade-offs</h2>
              <p className="font-mono mt-3 text-sm opacity-70">
                Each one states what was chosen and why the alternative was rejected.
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <Accordion type="single" collapsible className="mt-10 w-full">
                {project.highlights.map((h, i) => (
                  <AccordionItem key={h.title} value={`h-${i}`}>
                    <AccordionTrigger className="text-left">{h.title}</AccordionTrigger>
                    <AccordionContent>
                      <p className="max-w-prose leading-relaxed opacity-80">{h.detail}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="mt-12 flex flex-wrap gap-2" aria-label="Full stack">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="font-mono border border-line px-2.5 py-1 text-xs"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Next project — keeps the reader inside the work. */}
            <Reveal delay={0.15}>
              <nav aria-label="Next project" className="mt-20 border-t border-line pt-10">
                {(() => {
                  const i = projects.findIndex((p) => p.slug === project.slug)
                  const next = projects[(i + 1) % projects.length]
                  return (
                    <Link to={`/work/${next.slug}`} className="group block">
                      <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase opacity-60">
                        Next
                      </span>
                      <span className="mt-3 block text-3xl leading-tight group-hover:text-accent md:text-5xl">
                        {next.name} →
                      </span>
                    </Link>
                  )
                })()}
              </nav>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  )
}
