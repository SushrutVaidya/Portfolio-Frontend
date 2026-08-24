import { motion, useReducedMotion } from 'motion/react'
import { Frame, Grid } from '@/components/layout/Frame'
import { LoglensDemo } from '@/components/LoglensDemo'
import { ForgeRitual } from '@/components/ForgeRitual'
import { Reveal } from '@/components/Reveal'
import { DUR, EASE } from '@/lib/motion'

/**
 * Playground.
 *
 * The "try it" section: the two OSS tools made tangible. They are clearly
 * SEGREGATED now, each in its own hue-tinted panel with a header strip and a
 * divider between them, so it reads as two distinct things rather than one wide
 * column that happens to change halfway. loglens runs live (browser port of its
 * real core); Forge, which has no UI, runs its consecration animation, themed
 * on its real `@Omnissiah` annotation.
 */

/** A small heading strip that names a tool and its status, in its own hue. */
function ToolHeader({
  name,
  status,
  hue,
  blurb,
}: {
  name: string
  status: string
  hue: string
  blurb: string
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="t-heading">{name}</h3>
        <span
          className="t-label inline-flex items-center gap-2 rounded-full border-2 border-line-strong bg-paper-raised px-3 py-1"
          style={{ color: 'var(--color-ink)' }}
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: hue }}
          />
          {status}
        </span>
      </div>
      <p className="t-body mt-3 max-w-xl text-ink-muted">{blurb}</p>
    </div>
  )
}

export function Playground() {
  const reduceMotion = useReducedMotion()

  return (
    <Frame rule id="playground" aria-labelledby="playground-heading">
      <Grid>
        <div className="col-span-4 lg:col-span-12">
          <motion.span
            className="t-label text-accent"
            initial={reduceMotion ? undefined : { opacity: 0, x: -8 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DUR.base, ease: EASE }}
          >
            Try it
          </motion.span>
          <Reveal>
            <h2 id="playground-heading" className="t-display mt-4">
              Two of these, you can <span className="text-accent">poke at</span>.
            </h2>
          </Reveal>
        </div>
      </Grid>

      {/* Two segregated panels. Each is a tinted, bordered block so the eye reads
          them as separate tools; on lg they sit side by side with a real gap. */}
      <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
        {/* loglens — green, live. */}
        <motion.section
          aria-label="loglens, interactive"
          className="rounded-[calc(var(--radius)+6px)] border-2 border-line-strong p-5 lg:p-7"
          style={{ backgroundColor: 'color-mix(in oklab, var(--color-green) 8%, white)' }}
          initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: DUR.smooth, ease: EASE }}
        >
          <ToolHeader
            name="loglens, running here"
            status="live"
            hue="var(--color-green)"
            blurb="The same parser and templating as the CLI, ported to run in the page. Flip to --stats and watch four Postgres timeouts, each with a different IP and duration, collapse into one finding. Paste your own logs at the bottom."
          />
          <div className="mt-6">
            <LoglensDemo />
          </div>
        </motion.section>

        {/* Forge — purple, in progress. */}
        <motion.section
          aria-label="Forge, architecture animation"
          className="rounded-[calc(var(--radius)+6px)] border-2 border-line-strong p-5 lg:p-7"
          style={{ backgroundColor: 'color-mix(in oklab, var(--color-purple) 8%, white)' }}
          initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: DUR.smooth, ease: EASE, delay: 0.1 }}
        >
          <ToolHeader
            name="Forge, by shape"
            status="in progress"
            hue="var(--color-purple)"
            blurb="An AI-native Java framework, still early, so here is its architecture rather than a screenshot of something that does not exist yet. Its DI annotation is literally @Omnissiah, so this is what discovery looks like when the Machine God wires a marked class through the pipeline."
          />
          <div className="mt-6">
            <ForgeRitual />
          </div>
        </motion.section>
      </div>
    </Frame>
  )
}
