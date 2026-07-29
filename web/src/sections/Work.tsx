import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { projects, type Project } from '@/content/projects'

const STATUS_LABEL: Record<Project['status'], string> = {
  live: 'Live',
  archived: 'Archived',
  wip: 'In progress',
}

/**
 * Work.
 *
 * Two audiences, one component. A recruiter reads the summary, stack and
 * metrics and moves on in fifteen seconds. An engineer opens the highlights and
 * finds decisions with reasons attached — the advisory lock closing a TOCTOU
 * race, the cache that was silently re-hitting an upstream every request.
 *
 * The highlights sit in an accordion so the depth is available without making
 * the page a wall of prose. Collapsed by default, and each is a real disclosure
 * button, so keyboard and screen-reader users get the same access.
 */
export function Work() {
  return (
    <Section
      id="work"
      index="02"
      title="I ship systems, not demos"
      subtitle="migrations, locks, rate limits — the boring parts that decide whether it survives"
      accent="#0b24fb"
      stock="paper-100"
    >
      <div className="space-y-10">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.05}>
            <article className="border-2 border-black bg-card shadow-lg">
              <div className="border-b-2 border-black p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-head text-2xl md:text-4xl">{project.name}</h3>
                    <p className="font-mono mt-2 text-sm text-muted-foreground">
                      {project.tagline}
                    </p>
                  </div>
                  <span
                    className={[
                      'font-pixel shrink-0 border-2 border-black px-2 py-1 text-[0.65rem] tracking-widest uppercase',
                      project.status === 'live'
                        ? 'bg-[var(--section-accent)] text-white'
                        : 'bg-paper-300',
                    ].join(' ')}
                  >
                    {STATUS_LABEL[project.status]}
                  </span>
                </div>

                <p className="mt-5 max-w-prose leading-relaxed">{project.summary}</p>

                {project.metrics && (
                  <dl className="mt-6 flex flex-wrap gap-6">
                    {project.metrics.map((m) => (
                      <div key={m.label}>
                        <dt className="sr-only">{m.label}</dt>
                        <dd>
                          <span className="font-head block text-2xl tabular-nums">{m.value}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {m.label}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${project.name} stack`}>
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="font-mono border-2 border-black bg-paper-100 px-2 py-0.5 text-xs"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                  {project.href && (
                    <a
                      href={project.href}
                      className="retro-press font-head border-2 border-black bg-[var(--section-accent)] px-4 py-2 text-sm text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      {project.status === 'live' ? 'Open' : 'Read'} →
                    </a>
                  )}
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="retro-press font-head border-2 border-black bg-card px-4 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      Source ↗
                    </a>
                  )}
                </div>
              </div>

              {project.highlights.length > 0 && (
                <div className="p-6 md:p-8">
                  <h4 className="font-pixel mb-4 text-xs tracking-widest uppercase">
                    Engineering decisions
                  </h4>
                  <Accordion type="single" collapsible className="w-full">
                    {project.highlights.map((h, hi) => (
                      <AccordionItem key={h.title} value={`${project.slug}-${hi}`}>
                        <AccordionTrigger className="text-left">{h.title}</AccordionTrigger>
                        <AccordionContent>
                          <p className="max-w-prose leading-relaxed text-muted-foreground">
                            {h.detail}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
