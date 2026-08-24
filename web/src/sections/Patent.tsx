import { Frame, Grid, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { patent } from '@/content/site'

/**
 * Patent.
 *
 * One rare fact, given a colour block of its own so it reads as an achievement
 * rather than a footnote. The whole thing is a purple sticker-card: the title
 * links to the filing, the citation numbers sit in a row beneath.
 */
export function Patent() {
  return (
    <Frame rule id="patent" aria-labelledby="patent-heading">
      <Grid>
        <div className={col.full}>
          <span className="t-label text-purple">Patent</span>
        </div>

        <Reveal className={col.full}>
          <a
            href={patent.url}
            target="_blank"
            rel="noreferrer noopener"
            className="card-pop group/patent mt-2 block p-8 lg:p-12"
            style={{ backgroundColor: 'color-mix(in oklab, var(--color-purple) 12%, white)' }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <span
                className="font-display text-2xl font-extrabold tabular-nums"
                style={{ color: 'var(--color-purple)' }}
              >
                {patent.number}
              </span>
              <span className="t-label inline-flex items-center gap-2 rounded-full border-2 border-line-strong bg-paper-raised px-3 py-1 text-ink">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-purple)' }}
                />
                Granted {patent.granted}
              </span>
            </div>

            <h2 id="patent-heading" className="t-heading mt-6 max-w-3xl">
              <span className="rule-in-thick">{patent.title}</span>{' '}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-[var(--dur-fast)] ease-[var(--ease-pop)] group-hover/patent:translate-x-1 group-hover/patent:-translate-y-1"
              >
                ↗
              </span>
            </h2>

            <p className="t-sub mt-6 max-w-2xl">{patent.summary}</p>

            <dl className="mt-10 flex flex-wrap gap-x-14 gap-y-6 border-t-2 border-line-strong pt-6">
              {[
                ['Filed', patent.filed],
                ['Granted', patent.granted],
                ['Authority', patent.authority],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt className="t-label">{key}</dt>
                  <dd className="t-body mt-1 font-display font-bold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </a>
        </Reveal>
      </Grid>
    </Frame>
  )
}
