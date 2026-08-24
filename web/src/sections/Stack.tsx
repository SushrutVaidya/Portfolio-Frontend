import { Frame, Grid, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { capabilities, certifications } from '@/content/site'

/**
 * 04 — Stack.
 *
 * Not a wall of logos, and not a taxonomy either.
 *
 * A grid of technology icons communicates nothing: everyone has React and
 * Docker on theirs. "Languages / Frameworks / Infrastructure" is only marginally
 * better — it is a filing system for tools, and a reader still has to guess what
 * you can actually do with them.
 *
 * So each row is a CAPABILITY, the tools that deliver it, and one line on what
 * it bought in practice — each drawn from work that appears in the project
 * write-ups. No proficiency bars anywhere, because a self-assigned percentage is
 * unfalsifiable and every reader knows it.
 */
export function Stack() {
  return (
    <Frame rule tone="deep" id="stack" aria-labelledby="stack-heading">
      <Grid>
        <div className={col.rail}>
          <h2 id="stack-heading" className="t-heading">
            The stack, by what it lets me do.
          </h2>
          <ul className="mt-8 space-y-2">
            {certifications.map((cert) => (
              <li key={cert.name} className="t-label">
                {cert.name}
              </li>
            ))}
          </ul>
        </div>

        <div className={col.main}>
          <ul className="border-t border-line">
            {capabilities.map((capability, i) => (
              // Reveal is INSIDE the li, not around it: Reveal renders a div,
              // and <ul><div> is invalid — it drops the list semantics, so a
              // screen reader stops announcing "list, 6 items".
              <li key={capability.label} className="border-b border-line py-8">
                <Reveal delay={i * 0.04}>
                  <h3 className="t-heading">{capability.label}</h3>

                  <p className="t-body mt-4 max-w-xl text-ink-muted">{capability.buys}</p>

                  {/* Tools as spaced mono items, not a middot-joined string:
                      chaining `·` between six items is the separator overuse the
                      anti-slop rubric rations. Spacing carries the list. */}
                  <ul
                    className="mt-5 flex flex-wrap gap-x-4 gap-y-1"
                    aria-label={`${capability.label} tools`}
                  >
                    {capability.tools.map((tool) => (
                      <li key={tool} className="t-label">
                        {tool}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Grid>
    </Frame>
  )
}
