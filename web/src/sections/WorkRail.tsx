import { Link } from 'react-router-dom'
import { DragRail } from '@/components/DragRail'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { projects } from '@/content/projects'

/**
 * Work rail.
 *
 * Projects live on a horizontal drag track rather than in a vertical stack —
 * the device from niccolomiranda.com. It does real work here beyond novelty:
 * it puts every project at the same visual weight on one line, so the section
 * reads as a body of work instead of a ranked list, and it keeps the page short
 * enough that the sections below stay reachable.
 *
 * Each card is a link to /work/:slug. The depth lives on the case-study route,
 * so this section stays scannable.
 */
export function WorkRail() {
  return (
    <Section
      id="work"
      index="02"
      title="I ship systems, not demos"
      subtitle="locks, migrations, rate limits — the parts that decide whether it survives contact with users"
      accent="#0b24fb"
      stock="paper-100"
    >
      <Reveal>
        <DragRail hint="Drag sideways to explore →" ariaLabel="Selected projects">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="w-[min(84vw,26rem)] shrink-0 snap-start border-2 border-black bg-card shadow-lg"
            >
              {/* Masthead carries the project's own accent, previewing the
                  palette the case-study route commits to fully. */}
              <div
                className="border-b-2 border-black p-6"
                style={{ background: project.theme.stock, color: project.theme.ink }}
              >
                <p
                  className="font-pixel text-[0.6rem] tracking-[0.25em] uppercase"
                  style={{ color: project.theme.accent }}
                >
                  {project.year} · {project.status}
                </p>
                <h3 className="font-head mt-3 text-2xl leading-tight md:text-3xl">
                  {project.name}
                </h3>
                <p className="font-mono mt-2 text-xs opacity-80">{project.tagline}</p>
              </div>

              <div className="flex h-[calc(100%-9.5rem)] flex-col p-6">
                <p className="line-clamp-5 text-sm leading-relaxed">{project.summary}</p>

                <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={`${project.name} stack`}>
                  {project.stack.slice(0, 5).map((tech) => (
                    <li
                      key={tech}
                      className="font-mono border border-black bg-paper-200 px-1.5 py-0.5 text-[0.65rem]"
                    >
                      {tech}
                    </li>
                  ))}
                  {project.stack.length > 5 && (
                    <li className="font-mono px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                      +{project.stack.length - 5}
                    </li>
                  )}
                </ul>

                <Link
                  to={`/work/${project.slug}`}
                  className="retro-press font-head mt-auto inline-block self-start border-2 border-black bg-[var(--section-accent)] px-4 py-2 text-sm text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Read the case study →
                </Link>
              </div>
            </article>
          ))}
        </DragRail>
      </Reveal>
    </Section>
  )
}
