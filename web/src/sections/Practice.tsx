import { Corner, EdgeLabel, Folio, Frame, Grid, Marker, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { CountUp } from '@/components/CountUp'
import { folio } from '@/content/chapters'
import { experience, metrics } from '@/content/site'

/**
 * 03 — Practice.
 *
 * The career chapter, and it is deliberately not a timeline.
 *
 * There is exactly one role in the data. An animated vertical chronology with a
 * single node on it would be a visual lie about the length of a career, and
 * padding it out with projects and certifications to fill the shape would be a
 * worse one. So the role gets treated the way a single significant thing should
 * be: a spec block that reads like a manifest, the mandate at display scale, and
 * the four outcomes at display scale beneath it.
 *
 * The numbers count up once on entry. Each is defensible in an interview or it
 * would not be here — that constraint is written into content/site.ts.
 */
export function Practice() {
  const role = experience[0]

  return (
    <Frame rule id="practice" aria-labelledby="practice-heading">
      <Folio index={folio('practice')} title="Practice" />
      <EdgeLabel>{role.company}</EdgeLabel>

      <Grid>
        <div className={col.full}>
          <Marker index={folio('practice')} label="the practice" />
        </div>

        {/* Manifest: mono keys, mono values, hairline-separated. Set as a
            definition list because that is genuinely what it is. */}
        <dl className={`${col.rail} mt-14 space-y-5`}>
          {[
            ['Company', role.company],
            ['Via', role.via],
            ['Role', role.role],
            ['Period', role.period],
          ].map(([key, value]) => (
            <div key={key} className="border-b border-line pb-3">
              <dt className="t-label">{key}</dt>
              <dd className="t-body mt-1 text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className={`${col.main} mt-14`}>
          <Reveal>
            <h2 id="practice-heading" className="t-display">
              {role.summary}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="t-body mt-10 max-w-xl text-ink-muted">
              The work is unglamorous and I like it: someone else&apos;s pipeline is red,
              the graph is forty steps deep, and the failure is three layers below where
              the alert fired. Most of the improvement below came from removing the
              manual step that kept causing it.
            </p>
          </Reveal>
        </div>

        {/* Outcomes. Display scale and tabular figures, no cards, no icons —
            a number at this size does not need a container to be taken
            seriously. */}
        <dl className={`${col.full} mt-24 grid grid-cols-2 gap-x-8 gap-y-16 lg:grid-cols-4`}>
          {metrics.map((metric, i) => (
            <Reveal key={metric.label} delay={i * 0.06}>
              <div className="border-t border-line pt-6">
                <dt className="sr-only">{metric.label}</dt>
                <dd>
                  <span className="t-display block tabular-nums">
                    <CountUp value={metric.value} />
                  </span>
                  <span className="t-body mt-4 block max-w-[16ch] text-ink">{metric.label}</span>
                  <span className="t-label mt-2 block">{metric.detail}</span>
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </Grid>

      <Corner at="bottom-right">Figures measured, not estimated</Corner>
    </Frame>
  )
}
