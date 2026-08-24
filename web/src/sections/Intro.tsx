import { motion, useReducedMotion } from 'motion/react'
import { Bleed, Frame, Grid } from '@/components/layout/Frame'
import { DagScene } from '@/components/DagScene'
import { TechChips } from '@/components/TechChips'
import { experience, profile } from '@/content/site'
import { DUR, EASE, STAGGER_STEP } from '@/lib/motion'

/** Marathi, Telugu, Kannada, carried over from the original site. */
const GREETINGS = ['नमस्कार', 'నమస్కారం', 'ನಮಸ್ಕಾರ'] as const

// One coloured word per name-line, so the cover states the palette in the
// first second rather than saving colour for later.
const WORD_COLOUR = ['text-accent', 'text-blue'] as const

/**
 * The cover.
 *
 * Playful register: the name at mega weight, each line in a different palette
 * colour, rising out of clipping boxes with a spring overshoot. A pill status
 * chip and the role sit beneath it. The idea is still one-per-viewport, but the
 * mood is confident-loud rather than restrained-editorial.
 */
export function Intro({ ready }: { ready: boolean }) {
  const reduceMotion = useReducedMotion()

  const animate = ready ? 'in' : 'out'
  const rise = { out: { y: '115%' }, in: { y: '0%' } }

  return (
    <Frame full id="intro" aria-labelledby="intro-name">
      <Grid className="items-center">
        {/* Left: the identity. */}
        <div className="col-span-4 lg:col-span-7">
          {/* A pill chip: available-for-work status, the kind of loud-but-useful
              badge the playful register invites (and it is true). */}
          <motion.div
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border-2 border-line-strong bg-paper-raised px-4 py-1.5"
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
            animate={
              reduceMotion ? undefined : ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
            }
            transition={{ duration: DUR.base, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green" />
            </span>
            <span className="t-label text-ink">Open to platform &amp; backend roles</span>
          </motion.div>

          {/* Greetings, one quiet line. Only the first is announced. */}
          <div className="mb-6 flex flex-wrap items-baseline gap-x-7 gap-y-1">
            {GREETINGS.map((greeting, i) => (
              <span key={greeting} className="overflow-hidden">
                <motion.span
                  aria-hidden={i > 0 ? 'true' : undefined}
                  className="t-label block"
                  variants={rise}
                  initial="out"
                  animate={animate}
                  transition={{
                    duration: DUR.smooth,
                    ease: EASE,
                    delay: reduceMotion ? 0 : 0.1 + i * STAGGER_STEP,
                  }}
                >
                  {greeting}
                </motion.span>
              </span>
            ))}
          </div>

          {/* The name, two lines, each a different palette colour, rising out of
              its own clipping box with a spring overshoot. */}
          <Bleed>
            <h1 id="intro-name" className="t-mega">
              {profile.name.split(' ').map((word, i) => (
                <span key={word} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className={`block ${WORD_COLOUR[i] ?? ''}`}
                    variants={rise}
                    initial="out"
                    animate={animate}
                    transition={{
                      duration: 0.9,
                      ease: [0.34, 1.56, 0.64, 1],
                      delay: reduceMotion ? 0 : 0.28 + i * 0.1,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>
          </Bleed>

          {/* Role line, directly under the name now that the DAG owns the right. */}
          <motion.div
            className="mt-8 max-w-xl"
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={
              reduceMotion ? undefined : ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: DUR.smooth, ease: EASE, delay: reduceMotion ? 0 : 0.8 }}
          >
            <p className="t-sub text-ink">
              {profile.role} at{' '}
              <span className="font-display font-bold text-ink">{experience[0].company}</span>, via{' '}
              {experience[0].via}. I keep thousands of Airflow DAGs on schedule for ten-plus
              engineering teams.
            </p>
          </motion.div>
        </div>

        {/* Right: the DAG. Fills what was dead space, and it is literally the
            work the copy describes. Hidden below lg, where it would crowd the
            name; a full-height cover on a phone does not need it. */}
        <motion.div
          className="col-span-4 hidden lg:col-span-5 lg:block"
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={
            reduceMotion ? undefined : ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
          }
          transition={{ duration: DUR.smooth, ease: EASE, delay: reduceMotion ? 0 : 0.95 }}
        >
          <DagScene />
          <div className="mt-5">
            <TechChips />
          </div>
          <p className="t-body mt-5 text-ink-muted">
            I also built this page, and it reads its own state as you scroll.
          </p>
        </motion.div>
      </Grid>
    </Frame>
  )
}
