import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Frame, Grid } from '@/components/layout/Frame'
import { projects, type Project } from '@/content/projects'
import { DUR, EASE } from '@/lib/motion'

/**
 * Work.
 *
 * The centrepiece, as a colour bento of sticker-cards rather than one full-height
 * frame per project. Each card carries its project's hue as a soft ground and a
 * bold accent; loglens is featured wide with its real demo GIF. Cards press into
 * their offset shadow on hover (card-pop) and link through to the long-form
 * case study at /work/:slug, where the depth lives.
 *
 * Bento rhythm: loglens is the full-width feature card (it has a real preview),
 * then the other four sit as equal quarter-cards in one row. Five cells for five
 * projects, and no card is left stretched tall-and-empty.
 */

// Column spans per card. Base col-span-4 is full width on the 4-col mobile grid.
const SPAN = [
  'col-span-4 lg:col-span-12',
  'col-span-4 sm:col-span-2 lg:col-span-3',
  'col-span-4 sm:col-span-2 lg:col-span-3',
  'col-span-4 sm:col-span-2 lg:col-span-3',
  'col-span-4 sm:col-span-2 lg:col-span-3',
] as const

export function Work() {
  return (
    <Frame id="work" aria-labelledby="work-heading">
      <Grid>
        <div className="col-span-4 lg:col-span-12">
          <h2 id="work-heading" className="t-display">
            Open-source tools, systems,
            <br />
            and <span className="text-accent">a patent</span>.
          </h2>
          <p className="t-sub mt-6 max-w-xl">
            Most have a write-up covering the decisions and the trade-offs, including the
            ones that turned out wrong.
          </p>
        </div>
      </Grid>

      <Grid className="mt-14 lg:mt-20">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} ordinal={i + 1} span={SPAN[i]} />
        ))}
      </Grid>
    </Frame>
  )
}

function ProjectCard({
  project,
  ordinal,
  span,
}: {
  project: Project
  ordinal: number
  span: string
}) {
  const reduceMotion = useReducedMotion()
  const featured = Boolean(project.preview)
  const hueVar = `var(--color-${project.hue})`
  // A pastel ground: the hue mixed into white so ink stays readable on it.
  const tint = `color-mix(in oklab, ${hueVar} 12%, white)`

  const statusLabel =
    project.status === 'live' ? 'Live' : project.status === 'wip' ? 'In progress' : 'Archived'

  return (
    <motion.article
      className={span}
      initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DUR.base, ease: EASE, delay: (ordinal - 1) * 0.06 }}
    >
      <Link
        to={`/work/${project.slug}`}
        aria-label={`${project.name}: read the write-up`}
        className="card-pop group/card flex h-full flex-col overflow-hidden"
        style={{ backgroundColor: tint }}
      >
        {/* Featured preview: the real loglens GIF, in a bordered inset. */}
        {project.preview && (
          <div className="border-b-2 border-line-strong bg-paper-deep">
            <img
              src={project.preview.src}
              alt={project.preview.alt}
              loading="lazy"
              decoding="async"
              className="block max-h-[42vh] w-full object-contain object-center"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-6 lg:p-8">
          {/* Top row: ordinal in the hue + status pill. */}
          <div className="flex items-center justify-between">
            <span
              aria-hidden="true"
              className="font-display text-3xl font-extrabold tabular-nums"
              style={{ color: hueVar }}
            >
              {String(ordinal).padStart(2, '0')}
            </span>
            <span className="t-label inline-flex items-center gap-2 rounded-full border-2 border-line-strong bg-paper-raised px-3 py-1 text-ink">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: hueVar }}
              />
              {statusLabel}
            </span>
          </div>

          <h3 className="t-heading mt-5">
            <span className="rule-in-thick">{project.name}</span>
          </h3>
          <p className="t-sub mt-3">{project.tagline}</p>

          {/* Featured card gets the summary + metrics; the rest stay compact so
              the bento row-heights don't diverge wildly. */}
          {featured && (
            <p className="t-body mt-5 max-w-xl text-ink-muted">{project.summary}</p>
          )}

          {featured && project.metrics && (
            <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
              {project.metrics.slice(0, 3).map((m) => (
                <div key={m.label}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <span className="font-display text-2xl font-extrabold tabular-nums">
                      {m.value}
                    </span>
                    <span className="t-label mt-1 block max-w-[16ch]">{m.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {/* Stack chips, capped so cards stay tidy. */}
          <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${project.name} stack`}>
            {project.stack.slice(0, featured ? 6 : 4).map((tech) => (
              <li
                key={tech}
                className="t-label rounded-full border border-line-strong bg-paper-raised px-2.5 py-1 text-ink"
              >
                {tech}
              </li>
            ))}
          </ul>

          {/* CTA pinned to the card foot. */}
          <div className="mt-auto flex items-center gap-2 pt-8">
            <span className="t-label text-ink">
              {project.study ? 'Read the write-up' : 'See the repo'}
            </span>
            <span
              aria-hidden="true"
              className="transition-transform duration-[var(--dur-fast)] ease-[var(--ease-pop)] group-hover/card:translate-x-1"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
