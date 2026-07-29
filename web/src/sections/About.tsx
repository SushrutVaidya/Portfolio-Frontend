import { Reveal } from '@/components/Reveal'
import { CountUp } from '@/components/CountUp'
import { Section } from '@/components/Section'
import { certifications, experience, metrics } from '@/content/site'

/**
 * About.
 *
 * Leads with measured outcomes rather than adjectives. Every figure here is one
 * a recruiter can ask about and an engineer can defend — which is the only kind
 * worth putting on a page.
 */
export function About() {
  return (
    <Section
      id="about"
      index="01"
      title="I orchestrate thousands of DAGs"
      subtitle="and most of the job is making sure nobody notices"
      accent="#fc0"
      stock="paper-200"
    >
      {/* Metrics. tabular-nums so the figures align rather than jitter. */}
      <Reveal>
        <dl className="grid grid-cols-2 gap-0 border-2 border-black bg-card shadow-lg md:grid-cols-4">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={[
                'p-5 md:p-6',
                // Interior rules only — no double border against the container.
                i % 2 === 1 ? 'border-l-2 border-black' : '',
                i < 2 ? 'border-b-2 border-black md:border-b-0' : '',
                i === 2 ? 'md:border-l-2 md:border-black' : '',
              ].join(' ')}
            >
              <dt className="sr-only">{m.label}</dt>
              <dd>
                <span className="font-head block text-3xl tabular-nums md:text-5xl">
                  <CountUp value={m.value} />
                </span>
                <span className="mt-2 block text-sm leading-snug">{m.label}</span>
                <span className="font-mono mt-1 block text-xs text-muted-foreground">
                  {m.detail}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <div className="mt-12 grid gap-10 md:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          {experience.map((role) => (
            <Reveal key={role.company}>
              <article className="border-l-4 border-[var(--section-accent)] pl-5">
                <h3 className="font-head text-xl md:text-2xl">
                  {role.role} — {role.company}
                </h3>
                <p className="font-mono mt-1 text-xs text-muted-foreground">
                  via {role.via} · {role.period}
                </p>
                <p className="mt-4 max-w-prose leading-relaxed">{role.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
                  {role.stack.map((tech) => (
                    <li
                      key={tech}
                      className="font-mono border-2 border-black bg-paper-100 px-2 py-0.5 text-xs"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <aside className="border-2 border-black bg-card p-5 shadow-md">
            <h3 className="font-pixel text-xs tracking-widest uppercase">Certified</h3>
            <ul className="mt-4 space-y-3">
              {certifications.map((c) => (
                <li key={c.name}>
                  <span className="font-head block text-sm">{c.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{c.issuer}</span>
                </li>
              ))}
            </ul>
          </aside>
        </Reveal>
      </div>
    </Section>
  )
}
