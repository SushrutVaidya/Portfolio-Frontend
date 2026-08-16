import { motion, useReducedMotion } from 'motion/react'
import { Bleed, Corner, Frame, Grid, col } from '@/components/layout/Frame'
import { chapters } from '@/content/chapters'
import { experience, profile } from '@/content/site'
import { DUR, EASE, STAGGER_STEP } from '@/lib/motion'

/** Marathi, Telugu, Kannada — the three carried over from the original site. */
const GREETINGS = ['नमस्कार', 'నమస్కారం', 'ನಮಸ್ಕಾರ'] as const

/**
 * The cover.
 *
 * One idea per viewport, and on the cover the idea is the name. It occupies the
 * frame at mega scale on two lines; everything else is annotation pushed into
 * the margins. No centred column, no card, no "Hi, I'm" — the viewport IS the
 * composition.
 *
 * Deliberately absent: the live sentence, which used to be crammed in here
 * under the name alongside two buttons and a status line. Five competing
 * elements on the first screen is what made every previous version of this page
 * feel busy rather than confident. It now has a frame of its own.
 *
 * The cover carries no folio. A cover doesn't.
 */
export function Intro({ ready }: { ready: boolean }) {
  const reduceMotion = useReducedMotion()

  // The entrance waits on the preloader. Without the gate it plays behind the
  // curtain and the page looks already-settled the moment the curtain lifts,
  // which wastes the only entrance the site gets.
  const animate = ready ? 'in' : 'out'
  const rise = { out: { y: '110%' }, in: { y: '0%' } }

  return (
    <Frame full id="intro" aria-labelledby="intro-name">
      <Corner at="top-right">{profile.location}</Corner>

      <Grid>
        <div className={col.full}>
          {/* Three ways of saying hello is one piece of information, so only
              the first is announced. */}
          <div className="mb-10 flex flex-wrap items-baseline gap-x-7 gap-y-1">
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

          {/* Two lines rather than one, and that's the point: breaking the name
              lets the type run far larger than a single line ever could at this
              viewport width. Each word rises out of its own clipping box, which
              reads as type being set rather than content fading in. */}
          <Bleed>
            <h1 id="intro-name" className="t-mega">
              {profile.name.split(' ').map((word, i) => (
                <span key={word} className="block overflow-hidden pb-[0.04em]">
                  <motion.span
                    className="block"
                    variants={rise}
                    initial="out"
                    animate={animate}
                    transition={{
                      duration: 1,
                      ease: EASE,
                      delay: reduceMotion ? 0 : 0.28 + i * 0.09,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>
          </Bleed>
        </div>

        {/* Offset into the right-hand columns so the cover is a composition
            rather than a left-aligned stack. */}
        <motion.div
          className={`${col.right} mt-4 lg:mt-10`}
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={
            reduceMotion ? undefined : ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
          }
          transition={{ duration: DUR.smooth, ease: EASE, delay: reduceMotion ? 0 : 0.75 }}
        >
          <p className="t-sub text-ink">
            {profile.role} at {experience[0].company},{' '}
            <span className="font-display text-ink-muted italic">via {experience[0].via}</span>. I
            keep thousands of Airflow DAGs on schedule for ten-plus engineering teams.
          </p>
          <p className="t-body mt-5 text-ink-muted">
            I also built this — and it reads its own state as you scroll.
          </p>
        </motion.div>
      </Grid>

      <Corner at="bottom-left">Scroll</Corner>
      <Corner at="bottom-right">{chapters.length} chapters</Corner>
    </Frame>
  )
}
