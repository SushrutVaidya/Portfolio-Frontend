import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Frame, Grid, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { projects, type Project } from '@/content/projects'

/**
 * 02 — Work.
 *
 * The centrepiece, and it's built to look like one.
 *
 * Structure: an index frame that lists all three as a register — the same
 * hover-dimming device as the navigation, so the reader learns one interaction
 * and reuses it — then one project per FULL-HEIGHT frame.
 *
 * Cards were the wrong container. A row of cards says "here are three
 * comparable items, pick one"; a frame says "look at this one thing". Since the
 * claim being made is that these are substantial pieces of engineering, they get
 * the room to be substantial in.
 *
 * There are no project screenshots in the repo and none are invented here, so
 * the visual treatment is typographic: the ordinal set at mega scale in a rail,
 * parallaxing gently against the content, with the axis mirroring on every other
 * project so the chapter doesn't read as one layout repeated three times.
 */
export function Work() {
  return (
    <>
      <Frame rule id="work" aria-labelledby="work-heading">
        <Grid>
          <div className={col.wide}>
            <h2 id="work-heading" className="t-display">
              Open-source tools, systems, and a patent.
            </h2>
            <p className="t-sub mt-8 max-w-xl">
              Most have a write-up covering the decisions and the trade-offs, including
              the ones that turned out wrong.
            </p>
          </div>

          {/* The register. Doubles as a table of contents and as the fastest
              route for a reader who already knows what they're looking for. */}
          <nav aria-label="Projects" className={`${col.full} mt-24`}>
            <ul className="register border-t border-line">
              {projects.map((project, i) => (
                <li key={project.slug} className="register-row border-b border-line">
                  <Link
                    to={`/work/${project.slug}`}
                    className="group/row flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5 lg:gap-x-10"
                  >
                    <span className="t-label w-8 shrink-0 transition-colors group-hover/row:text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="t-heading transition-transform duration-[var(--dur-base)] group-hover/row:translate-x-3">
                      {project.name}
                    </span>
                    <span className="t-label ml-auto shrink-0">
                      {project.year} · {project.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Grid>
      </Frame>

      {projects.map((project, i) => (
        <ProjectFrame key={project.slug} project={project} ordinal={i + 1} />
      ))}
    </>
  )
}

function ProjectFrame({ project, ordinal }: { project: Project; ordinal: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  /**
   * Every other project mirrors: measure on the left, ordinal rail on the right.
   *
   * Three consecutive frames with identical geometry is a template applied three
   * times, and it reads as one. Flipping the axis costs two class strings and
   * makes the chapter feel art-directed per project rather than generated from
   * a loop — which, to be fair, it still is.
   */
  const mirrored = ordinal % 2 === 0

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Small on purpose. A large parallax on type is motion sickness, not design.
  const numberY = useTransform(scrollYProgress, [0, 1], ['14%', '-14%'])

  const label = String(ordinal).padStart(2, '0')
  const external = project.href?.startsWith('http')

  return (
    <Frame full rule aria-labelledby={`project-${project.slug}`}>
      <div ref={ref}>
        <Grid className="items-start">
          {/* The ordinal at mega scale, faint, parallaxed. It is allowed to run
              wider than its two-column rail: type spilling into the gutter is
              the effect, not a bug. */}
          <div className={`${mirrored ? col.railRight : col.rail} hidden lg:block`}>
            <motion.span
              aria-hidden="true"
              className="t-mega block text-ink-faint"
              style={reduceMotion ? undefined : { y: numberY }}
            >
              {label}
            </motion.span>
          </div>

          <div className={mirrored ? col.mainLeft : col.main}>
            <Reveal>
              {/* The project name IS the link to its write-up. A separate
                  "read more" button under a non-interactive heading is a
                  smaller target for more markup. */}
              <h3 id={`project-${project.slug}`} className="t-display">
                <Link to={`/work/${project.slug}`} className="rule-in-thick">
                  {project.name}
                </Link>
              </h3>
            </Reveal>

            <Reveal delay={0.04}>
              <p className="t-label mt-4">
                {project.year} · {project.status}
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <p className="t-sub mt-7 max-w-2xl font-display italic">{project.tagline}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="t-body mt-8 max-w-xl text-ink-muted">{project.summary}</p>
            </Reveal>

            {project.metrics && (
              <Reveal delay={0.14}>
                <dl className="mt-14 flex flex-wrap gap-x-14 gap-y-7">
                  {project.metrics.slice(0, 3).map((m) => (
                    <div key={m.label}>
                      <dt className="sr-only">{m.label}</dt>
                      <dd>
                        <span className="t-heading block tabular-nums">{m.value}</span>
                        <span className="t-label mt-2 block max-w-[16ch]">{m.label}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}

            <Reveal delay={0.18}>
              <ul
                className="mt-14 flex flex-wrap gap-x-5 gap-y-2"
                aria-label={`${project.name} stack`}
              >
                {project.stack.map((tech) => (
                  <li key={tech} className="t-label">
                    {tech}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-line pt-8">
                <Link to={`/work/${project.slug}`} className="t-sub rule-in text-ink">
                  Read the write-up
                </Link>
                {project.href && (
                  <a
                    href={project.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer noopener' : undefined}
                    className="t-label rule-in"
                  >
                    {project.status === 'live' ? 'Open ↗' : 'Filing ↗'}
                  </a>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="t-label rule-in"
                  >
                    Source ↗
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </Grid>
      </div>
    </Frame>
  )
}
