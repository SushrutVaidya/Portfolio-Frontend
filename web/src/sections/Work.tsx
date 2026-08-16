import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Corner, Frame, Grid, Marker, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { projects } from '@/content/projects'

/**
 * Work.
 *
 * One project per full-height frame, not cards on a rail. A card says "here are
 * three comparable items"; a frame says "look at this one thing". Since the whole
 * point is that these are substantial pieces of engineering, they get the room.
 *
 * The index number is set at display scale in the left rail and parallaxes
 * slightly against the content - the cheapest available way to make a scroll feel
 * composed rather than paged.
 */
export function Work() {
  return (
    <>
      <Frame rule id="work" aria-labelledby="work-heading">
        <Grid>
          <div className={col.full}>
            <Marker index="02" label="selected work" />
          </div>
          <div className={`${col.wide} mt-12`}>
            <h2 id="work-heading" className="t-heading normal-case">
              Three things I built and still maintain.
            </h2>
            <p className="t-sub mt-8 max-w-xl">
              Each one has a write-up covering the decisions and the trade-offs,
              including the ones that turned out wrong.
            </p>
          </div>
        </Grid>
      </Frame>

      {projects.map((project, i) => (
        <ProjectFrame key={project.slug} index={i} />
      ))}
    </>
  )
}

function ProjectFrame({ index }: { index: number }) {
  const project = projects[index]
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Small: a big parallax on text is motion sickness, not design.
  const numberY = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])

  const ordinal = String(index + 1).padStart(2, '0')

  return (
    <Frame full rule className="overflow-hidden">
      <Corner at="top-right">
        {project.year} · {project.status}
      </Corner>

      <div ref={ref}>
        <Grid className="items-start">
          {/* Left rail: the ordinal at display scale, parallaxed. */}
          <div className={`${col.rail} hidden lg:block`}>
            <motion.span
              aria-hidden="true"
              className="t-display block text-ink-faint"
              style={reduceMotion ? undefined : { y: numberY }}
            >
              {ordinal}
            </motion.span>
          </div>

          <div className={col.main}>
            <Reveal>
              <h3 className="t-heading">{project.name}</h3>
            </Reveal>

            <Reveal delay={0.06}>
              <p className="t-sub mt-6 max-w-2xl">{project.tagline}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="t-body mt-8 max-w-xl text-ink-muted">{project.summary}</p>
            </Reveal>

            {project.metrics && (
              <Reveal delay={0.14}>
                <dl className="mt-12 flex flex-wrap gap-x-14 gap-y-6">
                  {project.metrics.slice(0, 3).map((m) => (
                    <div key={m.label}>
                      <dt className="sr-only">{m.label}</dt>
                      <dd>
                        <span className="t-heading block tabular-nums">{m.value}</span>
                        <span className="t-label mt-2 block">{m.label}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}

            <Reveal delay={0.18}>
              <ul className="mt-12 flex flex-wrap gap-x-5 gap-y-2" aria-label={`${project.name} stack`}>
                {project.stack.map((tech) => (
                  <li key={tech} className="t-label">
                    {tech}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4">
                <Link to={`/work/${project.slug}`} className="t-sub rule-in text-ink">
                  Read the write-up
                </Link>
                {project.href && (
                  <a
                    href={project.href}
                    target={project.href.startsWith('http') ? '_blank' : undefined}
                    rel={project.href.startsWith('http') ? 'noreferrer noopener' : undefined}
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
