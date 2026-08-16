import { Corner, Frame, Grid, Marker, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { CountUp } from '@/components/CountUp'
import { certifications, experience, metrics, patent, stack } from '@/content/site'

const STACK_GROUPS = [
  { key: 'languages', label: 'Languages' },
  { key: 'frameworks', label: 'Frameworks' },
  { key: 'infra', label: 'Infrastructure' },
  { key: 'data', label: 'Data' },
  { key: 'observability', label: 'Observability' },
  { key: 'cloud', label: 'Cloud' },
] as const satisfies readonly { key: keyof typeof stack; label: string }[]

/**
 * Ledger.
 *
 * About, metrics, stack and the patent collapsed into one dense data frame.
 *
 * Previously these were four separate full-height sections, which meant four
 * headings, four reveals and four scroll-stops for what is really one idea: the
 * evidence. Consolidating them makes the page shorter and the section that
 * matters - Work - proportionally more prominent. Density is the point here; the
 * mono labels and hairlines are doing the structural work rather than boxes.
 */
export function Ledger() {
  return (
    <>
      {/* Metrics: display-scale numerals in an asymmetric row, no cards. */}
      <Frame rule id="about" aria-labelledby="about-heading">
        <Corner at="top-right">{experience[0].company}</Corner>

        <Grid>
          <div className={col.full}>
            <Marker index="03" label="the evidence" />
          </div>

          <div className={`${col.wide} mt-12`}>
            <h2 id="about-heading" className="t-heading normal-case">
              {experience[0].summary}
            </h2>
          </div>

          <dl className={`${col.full} mt-20 grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4`}>
            {metrics.map((m, i) => (
              <Reveal key={m.label} delay={i * 0.05}>
                <div>
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <span className="t-display block tabular-nums leading-none">
                      <CountUp value={m.value} />
                    </span>
                    <span className="t-body mt-5 block max-w-[14ch] text-ink">{m.label}</span>
                    <span className="t-label mt-2 block">{m.detail}</span>
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Grid>
      </Frame>

      {/* Stack: a dense mono index. Deliberately not a tag cloud - the grouping
          is the information, and no proficiency bars, because a self-assigned
          percentage is unfalsifiable. */}
      <Frame rule id="stack" aria-labelledby="stack-heading">
        <Grid>
          <div className={col.rail}>
            <h2 id="stack-heading" className="t-label">
              04 — stack
            </h2>
            <p className="t-body mt-6 max-w-[24ch] text-ink-muted">
              Backend and platform is where I&apos;m strongest. This site is the
              frontend proof.
            </p>
            <ul className="mt-10 space-y-1">
              {certifications.map((c) => (
                <li key={c.name} className="t-label">
                  {c.name}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${col.main} space-y-px`}>
            {STACK_GROUPS.map((group, i) => (
              <Reveal key={group.key} delay={i * 0.04}>
                <div className="grid grid-cols-4 items-baseline gap-4 border-b border-line py-5 lg:grid-cols-5">
                  <span className="t-label col-span-4 lg:col-span-1">{group.label}</span>
                  <p className="t-body col-span-4 text-ink">{stack[group.key].join(' · ')}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Grid>
      </Frame>

      {/* Patent: one fact, one frame. A granted patent is rare enough that
          burying it in a bullet list would be the wrong call. */}
      <Frame rule id="patent" aria-labelledby="patent-heading">
        <Corner at="top-right">{patent.authority}</Corner>

        <Grid>
          <div className={col.rail}>
            <span className="t-label">05 — patent</span>
          </div>

          <div className={col.main}>
            <Reveal>
              <h2 id="patent-heading" className="t-heading normal-case">
                <a
                  href={patent.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rule-in"
                >
                  {patent.title} ↗
                </a>
              </h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="t-body mt-8 max-w-xl text-ink-muted">{patent.summary}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <dl className="mt-12 flex flex-wrap gap-x-14 gap-y-6">
                {[
                  ['Patent no.', patent.number],
                  ['Filed', patent.filed],
                  ['Granted', patent.granted],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="t-label">{label}</dt>
                    <dd className="t-sub mt-2 tabular-nums text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Grid>
      </Frame>
    </>
  )
}
