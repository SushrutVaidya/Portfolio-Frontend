import { Frame, Grid, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { patent } from '@/content/site'

/**
 * 05 — Patent.
 *
 * One fact, one frame, full height.
 *
 * A granted patent is rare enough that burying it in a bullet list under
 * "achievements" would be the wrong call — but it is also two years old and not
 * what he does now, so it gets a quiet frame rather than a loud one. The title
 * is the link; the numbers sit in the margin as a citation would.
 */
export function Patent() {
  return (
    <Frame full rule id="patent" aria-labelledby="patent-heading">
      <Grid>
        <div className={`${col.rail} hidden lg:block`}>
          <span aria-hidden="true" className="t-label">
            Patent no.
          </span>
          <span className="t-heading mt-2 block tabular-nums text-accent">{patent.number}</span>
        </div>

        <div className={col.main}>
          <Reveal>
            <h2 id="patent-heading" className="t-display">
              <a
                href={patent.url}
                target="_blank"
                rel="noreferrer noopener"
                className="rule-in-thick"
              >
                {patent.title} ↗
              </a>
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="t-sub mt-10 max-w-xl">{patent.summary}</p>
          </Reveal>

          <Reveal delay={0.12}>
            <dl className="mt-16 flex flex-wrap gap-x-16 gap-y-7 border-t border-line pt-8">
              {[
                ['Patent no.', patent.number],
                ['Filed', patent.filed],
                ['Granted', patent.granted],
                ['Authority', patent.authority],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt className="t-label">{key}</dt>
                  <dd className="t-body mt-2 tabular-nums text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Grid>
    </Frame>
  )
}
