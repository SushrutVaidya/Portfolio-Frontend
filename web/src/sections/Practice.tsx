import { Frame, Grid, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { CountUp } from '@/components/CountUp'
import { experience, metrics } from '@/content/site'

/**
 * Practice.
 *
 * The career chapter, deliberately not a timeline (there is one role in the
 * data; a chronology with a single node would be a visual lie). The mandate is
 * stated big; the outcomes are colour sticker-cards, each a different hue, so
 * the numbers read as the loud, confident part of the page they should be.
 */

// One palette colour per outcome, cycled.
const METRIC_HUE = ['red', 'blue', 'green', 'yellow'] as const

export function Practice() {
  const role = experience[0]

  return (
    <Frame rule id="practice" aria-labelledby="practice-heading">
      <Grid>
        {/* Manifest: the role as a spec card. */}
        <dl className={`${col.rail} card-pop h-fit bg-paper-raised p-5`}>
          {[
            ['Company', role.company],
            ['Via', role.via],
            ['Role', role.role],
            ['Period', role.period],
          ].map(([key, value], i, arr) => (
            <div
              key={key}
              className={i < arr.length - 1 ? 'border-b border-line pb-3' : ''}
              style={i > 0 ? { marginTop: '0.85rem' } : undefined}
            >
              <dt className="t-label">{key}</dt>
              <dd className="t-body mt-1 font-display font-bold text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className={col.main}>
          <span className="t-label text-accent">Practice</span>
          <Reveal>
            <h2 id="practice-heading" className="t-display mt-4">
              {role.summary}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="t-body mt-8 max-w-xl text-ink-muted">
              The work is unglamorous and I like it: someone else&apos;s pipeline is red,
              the graph is forty steps deep, and the failure is three layers below where
              the alert fired. Most of the improvement below came from removing the
              manual step that kept causing it.
            </p>
          </Reveal>
        </div>

        {/* Outcomes as colour cards. */}
        <dl className={`${col.full} mt-16 grid grid-cols-2 gap-5 lg:grid-cols-4`}>
          {metrics.map((metric, i) => {
            const hue = `var(--color-${METRIC_HUE[i % METRIC_HUE.length]})`
            return (
              <Reveal key={metric.label} delay={i * 0.06}>
                <div
                  className="card-pop h-full p-6"
                  style={{ backgroundColor: `color-mix(in oklab, ${hue} 14%, white)` }}
                >
                  <dt className="sr-only">{metric.label}</dt>
                  <dd>
                    <span
                      className="font-display block text-5xl font-extrabold tabular-nums lg:text-6xl"
                      style={{ color: hue }}
                    >
                      <CountUp value={metric.value} />
                    </span>
                    <span className="mt-4 block font-display font-bold text-ink">
                      {metric.label}
                    </span>
                    <span className="t-label mt-2 block">{metric.detail}</span>
                  </dd>
                </div>
              </Reveal>
            )
          })}
        </dl>
      </Grid>
    </Frame>
  )
}
