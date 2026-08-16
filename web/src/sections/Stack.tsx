import { EdgeLabel, Folio, Frame, Grid, Marker, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { folio } from '@/content/chapters'
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
      <Folio index={folio('stack')} title="Stack" />
      <EdgeLabel>{capabilities.length} capabilities</EdgeLabel>

      <Grid>
        <div className={col.full}>
          <Marker index={folio('stack')} label="what it buys" />
        </div>

        <div className={`${col.rail} mt-14`}>
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

        <div className={`${col.main} mt-14`}>
          <ul className="border-t border-line">
            {capabilities.map((capability, i) => (
              // Reveal is INSIDE the li, not around it: Reveal renders a div,
              // and <ul><div> is invalid — it drops the list semantics, so a
              // screen reader stops announcing "list, 6 items".
              <li key={capability.label} className="border-b border-line py-8">
                <Reveal delay={i * 0.04}>
                  <div className="flex items-baseline gap-5">
                    <span aria-hidden="true" className="t-label shrink-0 text-accent">
                      {folio('stack')}.{i + 1}
                    </span>
                    <h3 className="t-heading">{capability.label}</h3>
                  </div>

                  <p className="t-body mt-4 max-w-xl text-ink-muted">{capability.buys}</p>

                  {/* Tools as a plain mono line. Middots rather than pills: a
                      border around each word triples the visual weight of
                      something that is only there to be scanned. */}
                  <p className="t-label mt-5">{capability.tools.join('  ·  ')}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Grid>
    </Frame>
  )
}
