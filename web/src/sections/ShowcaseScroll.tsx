import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Link } from 'react-router-dom'
import { projects } from '@/content/projects'
import { contrastInk } from '@/lib/color'
import { SplitText } from '@/components/SplitText'
import { Magnetic } from '@/components/Magnetic'

/**
 * Full-bleed scroll-driven project showcase.
 *
 * Replaces the drag rail. The section is tall (one viewport per project) and
 * pinned; vertical scroll inside it translates the horizontal track. That's the
 * structural device the reference sites use to make a projects section feel like
 * a sequence of statements rather than a list of cards.
 *
 * Why scroll-linked rather than scroll-jacked: the page never intercepts or
 * re-times the user's scroll, it only maps progress to an x offset. Hijacking
 * scroll breaks trackpad momentum, find-in-page and keyboard paging — the
 * common failure of these sections.
 *
 * Falls back to a plain vertical stack under reduced motion and on narrow
 * viewports, where a horizontal track has nowhere to go.
 */
export function ShowcaseScroll() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsNarrow(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsNarrow(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const { scrollYProgress } = useScroll({ target: sectionRef })
  // n panels means the track travels (n-1) viewport widths.
  const travel = -100 * (projects.length - 1)
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `${travel}%`])
  const useHorizontal = !reduceMotion && !isNarrow

  if (!useHorizontal) {
    return (
      <section
        id="work"
        aria-labelledby="work-heading"
        className="bg-paper border-t border-line px-6 py-20"
      >
        <h2 id="work-heading" className="text-3xl leading-[0.95]">
          <SplitText>I ship systems, not demos</SplitText>
        </h2>
        <div className="mt-12 space-y-8">
          {projects.map((p, i) => (
            <ProjectPanel key={p.slug} index={i} stacked />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-labelledby="work-heading"
      // Height drives the scroll distance: one viewport per panel.
      style={{ height: `${projects.length * 100}vh` }}
      className="relative border-t border-line"
    >
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden">
        <header className="bg-paper flex items-baseline gap-4 border-b border-line px-6 py-5 md:px-12">
          <span aria-hidden="true" className="font-mono text-sm text-accent">
            02
          </span>
          <h2 id="work-heading" className="text-xl md:text-3xl">
            <SplitText>I ship systems, not demos</SplitText>
          </h2>
          <span className="font-mono ml-auto hidden text-xs text-muted-foreground md:block">
            scroll ↓
          </span>
        </header>

        <motion.div style={{ x }} className="flex h-full flex-none">
          {projects.map((project, i) => (
            <ProjectPanel key={project.slug} index={i} />
          ))}
        </motion.div>

        {/* Panel progress — orientation inside a pinned section, which otherwise
            hides how far through you are. */}
        <div
          aria-hidden="true"
          className="bg-paper flex items-center gap-2 border-t border-line px-6 py-3 md:px-12"
        >
          {projects.map((p, i) => (
            <ProgressTick key={p.slug} progress={scrollYProgress} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProgressTick({
  progress,
  index,
}: {
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  index: number
}) {
  const total = projects.length
  const start = index / total
  const end = (index + 1) / total
  const scaleX = useTransform(progress, [start, end], [0, 1], { clamp: true })
  return (
    <div className="h-1.5 flex-1 border border-line">
      <motion.div className="h-full origin-left bg-accent" style={{ scaleX }} />
    </div>
  )
}

/**
 * One project, full viewport. Typography-led rather than card-led — the panel
 * IS the project, so the name is display-scale and the palette is the project's
 * own.
 */
function ProjectPanel({ index, stacked = false }: { index: number; stacked?: boolean }) {
  const project = projects[index]
  const ink = project.theme.ink
  const accentInk = contrastInk(project.theme.accent)

  return (
    <article
      style={{ background: project.theme.stock, color: ink }}
      className={[
        'flex flex-col justify-center border-line px-6 md:px-16',
        stacked ? 'border py-14 shadow-lg' : 'h-full w-screen flex-none border-r-4 py-10',
      ].join(' ')}
    >
      <div className="mx-auto w-full max-w-5xl">
        <p
          className="font-mono text-[0.65rem] tracking-[0.3em] uppercase"
          style={{ color: project.theme.accent }}
        >
          {String(index + 1).padStart(2, '0')} — {project.year} · {project.status}
        </p>

        <h3 className="mt-5 text-[clamp(2rem,6.5vw,5.5rem)] leading-[0.86]">
          <SplitText>{project.name}</SplitText>
        </h3>

        <p className="mt-5 max-w-2xl text-lg opacity-90 md:text-2xl">{project.tagline}</p>

        <p className="mt-6 max-w-2xl leading-relaxed opacity-75">{project.summary}</p>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          {project.metrics?.slice(0, 3).map((m) => (
            <div key={m.label}>
              <span className="font-display block text-2xl tabular-nums md:text-4xl">{m.value}</span>
              <span className="font-mono text-[0.7rem] opacity-70">{m.label}</span>
            </div>
          ))}
        </div>

        <ul className="mt-8 flex flex-wrap gap-2" aria-label={`${project.name} stack`}>
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="font-mono border px-2 py-0.5 text-[0.7rem]"
              style={{ borderColor: ink, opacity: 0.8 }}
            >
              {tech}
            </li>
          ))}
        </ul>

        <Magnetic>
          <Link
            to={`/work/${project.slug}`}
            className="font-display mt-10 inline-block border px-6 py-3 text-base shadow-md transition-transform duration-[var(--dur-fast)]"
            style={{
              background: project.theme.accent,
              color: accentInk,
              borderColor: ink,
              boxShadow: `5px 5px 0 0 ${ink}`,
            }}
          >
            Read the case study →
          </Link>
        </Magnetic>
      </div>
    </article>
  )
}
