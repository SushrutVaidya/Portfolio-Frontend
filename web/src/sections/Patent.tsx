import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { patent } from '@/content/site'

/**
 * Patent.
 *
 * Its own section rather than a bullet in About: a granted patent is a rare
 * credential and burying it would be a mistake. Links to the published PDF,
 * because a verifiable claim is worth more than an unverifiable one.
 */
export function Patent() {
  return (
    <Section
      id="patent"
      index="04"
      title="I have a patent"
      subtitle="it's about solar panels, and I will bring it up unprompted"
    >
      <Reveal>
        <article className="border border-line bg-card p-6 shadow-lg md:p-8">
          <h3 className="t-heading">
            <a
              href={patent.url}
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-[var(--accent)] decoration-1 underline-offset-4 hover:bg-accent hover:text-accent-ink "
            >
              {patent.title} ↗
            </a>
          </h3>

          <p className="mt-5 max-w-prose leading-relaxed">{patent.summary}</p>

          <dl className="font-mono mt-6 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Patent no.</dt>
              <dd className="font-display mt-1 tabular-nums">{patent.number}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Filed</dt>
              <dd className="mt-1">{patent.filed}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Granted</dt>
              <dd className="mt-1">{patent.granted}</dd>
            </div>
          </dl>

          <p className="t-label mt-8">
            {patent.authority}
          </p>
        </article>
      </Reveal>
    </Section>
  )
}
