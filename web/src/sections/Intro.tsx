import { motion, useReducedMotion } from 'motion/react'
import { Bleed, Corner, Frame, Grid, col } from '@/components/layout/Frame'
import { HoverTrigger } from '@/components/HoverTrigger'
import { useLiveClock } from '@/hooks/useLiveClock'
import { useStats } from '@/hooks/useStats'
import { profile } from '@/content/site'
import { DUR, EASE, STAGGER_STEP } from '@/lib/motion'

const GREETINGS = ['नमस्कार', 'నమస్కారం', 'ನಮಸ್ಕಾರ'] as const

/**
 * Intro.
 *
 * One idea per viewport. The name occupies the frame at display scale and
 * everything else is annotation pushed to the edges - role and location in the
 * top corners, the scroll cue at the bottom. There is no centred column and no
 * card; the viewport IS the composition.
 *
 * The live sentence moves to its own frame rather than crowding this one. Trying
 * to fit the name, the greeting, the sentence, two buttons and a status line into
 * one screen is what made every previous version feel busy.
 */
export function Intro({ ready }: { ready: boolean }) {
  const reduceMotion = useReducedMotion()

  // The entrance waits for the preloader; otherwise it plays behind the curtain
  // and the page looks already-settled when it lifts.
  const animate = ready ? 'in' : 'out'
  const rise = {
    out: { y: '110%' },
    in: { y: '0%' },
  }

  return (
    <Frame full id="intro" aria-labelledby="intro-name">
      <Corner at="top-left">{profile.role}</Corner>
      <Corner at="top-right">{profile.location}</Corner>

      <Grid>
        <div className={col.full}>
          {/* Greetings as a single quiet line above the name. Only the first is
              announced; three ways of saying hello is one piece of information. */}
          <div className="mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-1 overflow-hidden">
            {GREETINGS.map((g, i) => (
              <span key={g} className="overflow-hidden">
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
                  {g}
                </motion.span>
              </span>
            ))}
          </div>

          {/* The name, on two lines, bleeding left. Two lines rather than one is
              deliberate: it lets the type be far larger than a single line would
              allow at this viewport width. */}
          <Bleed>
            <h1 id="intro-name" className="t-display">
              {profile.name.split(' ').map((word, i) => (
                <span key={word} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    variants={rise}
                    initial="out"
                    animate={animate}
                    transition={{
                      duration: 1,
                      ease: EASE,
                      delay: reduceMotion ? 0 : 0.3 + i * 0.09,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>
          </Bleed>
        </div>
      </Grid>

      <Corner at="bottom-right">scroll</Corner>
    </Frame>
  )
}

/**
 * The live sentence, given a frame of its own.
 *
 * This is the only genuinely live content on the page, so it gets the whole
 * viewport rather than being tucked under the name. Offset into the right-hand
 * columns so it does not sit where the name did - consecutive full-height frames
 * with content in the same place read as one long column.
 */
export function Statement() {
  const { stats, live } = useStats()
  const time = useLiveClock()

  return (
    <Frame full rule id="now" aria-labelledby="now-heading">
      <Corner at="top-left">01 — now</Corner>

      <Grid>
        <h2 id="now-heading" className="sr-only">
          Right now
        </h2>

        <div className={col.wide}>
          <p className="t-heading normal-case">
            It&apos;s <span className="tabular-nums">{time}</span> where you are. I&apos;m in{' '}
            <HoverTrigger
              spec={{
                id: 'city',
                label: `${stats.location} city loop`,
                visual: { kind: 'image', src: '/img/Hyderabad.gif' },
              }}
            >
              {stats.location}
            </HoverTrigger>
            , the last song was{' '}
            <HoverTrigger
              spec={{
                id: 'song',
                label: `${stats.songName}, playing`,
                visual: { kind: 'image', src: '/img/gintamaBreakDancing.gif' },
                // resume:true - one continuous listen across hovers, not a
                // restart each time. The detail that sells it.
                audio: stats.songURL ? { src: stats.songURL, volume: 0.5, resume: true } : undefined,
              }}
            >
              {stats.songName}
            </HoverTrigger>
            , the last game was{' '}
            <HoverTrigger
              spec={{
                id: 'game',
                label: `${stats.game} clip`,
                visual: { kind: 'image', src: '/img/counterStrike2.gif' },
              }}
            >
              {stats.game}
            </HoverTrigger>
            , and I&apos;m reading{' '}
            <HoverTrigger
              spec={{
                id: 'book',
                label: `${stats.bookName ?? 'this book'}, with crickets`,
                visual: {
                  kind: 'video',
                  // .mov (hvc1) first for Safari's better codec; .mp4 fallback.
                  sources: [
                    { src: '/img/study.mov', type: 'video/mp4; codecs="hvc1"' },
                    { src: '/img/study.mp4', type: 'video/mp4' },
                  ],
                },
                audio: { src: '/img/crickets.mp3', volume: 0.3, loop: true },
              }}
            >
              {stats.bookName ?? 'this book'}
            </HoverTrigger>
            .
          </p>
        </div>
      </Grid>

      {/* Honest about provenance. A reader who opens DevTools and finds a failed
          request next to confident copy notices. */}
      <Corner at="bottom-left" decorative={false}>
        {live === null ? 'checking' : live ? 'live · /api/stats' : 'cached · api unreachable'}
      </Corner>
    </Frame>
  )
}
