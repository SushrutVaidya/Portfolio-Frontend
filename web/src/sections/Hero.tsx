import { motion, useReducedMotion } from 'motion/react'
import { HoverTrigger } from '@/components/HoverTrigger'
import { useLiveClock } from '@/hooks/useLiveClock'
import { useStats } from '@/hooks/useStats'
import { profile } from '@/content/site'
import { DUR, EASE_EXPO_OUT, STAGGER_STEP } from '@/lib/motion'

const GREETINGS = ['hello', 'नमस्कार', 'नमस्ते', 'నమస్కారం', 'ನಮಸ್ಕಾರ'] as const

/**
 * Hero.
 *
 * The stat sentence is the one piece of genuinely live content on the page, so
 * it leads. It renders immediately from STATS_FALLBACK and upgrades in place
 * when /api/stats resolves — there is no spinner and no layout shift, because
 * the fallback has the same shape as the real data.
 *
 * Media assets are referenced as absolute /img/... paths, served by nginx.
 * They are not imported: img/ is 85 MB and study.gif alone is 63 MB, so pulling
 * them through the bundler would be catastrophic for build time and caching.
 */
export function Hero() {
  const { stats, live } = useStats()
  const time = useLiveClock()
  const reduceMotion = useReducedMotion()

  return (
    <header
      id="hero"
      className="bg-paper-100 relative flex min-h-dvh flex-col justify-center px-6 py-24 md:px-12"
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* Multilingual greeting. aria-hidden on all but the first: the same
            word five times is noise to a screen reader, not information. */}
        <div className="mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {GREETINGS.map((greeting, i) => (
            <motion.span
              key={greeting}
              aria-hidden={i > 0 ? 'true' : undefined}
              className="font-head text-lg md:text-2xl"
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: DUR.base, delay: i * STAGGER_STEP, ease: EASE_EXPO_OUT }}
            >
              {greeting}
              {i === 0 && <span className="text-[var(--section-accent)]">.</span>}
            </motion.span>
          ))}
        </div>

        <motion.h1
          className="text-[clamp(2.75rem,11vw,9rem)] leading-[0.82]"
          initial={reduceMotion ? undefined : { opacity: 0, y: 32 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: DUR.hero, delay: 0.45, ease: EASE_EXPO_OUT }}
        >
          {profile.name}
        </motion.h1>

        <motion.p
          className="font-pixel mt-6 text-[0.7rem] tracking-[0.2em] uppercase md:text-xs"
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={{ duration: DUR.base, delay: 0.7 }}
        >
          {profile.role} · {profile.location}
        </motion.p>

        {/* The live sentence. Each trigger is a real button — see HoverTrigger. */}
        <motion.div
          className="mt-12 max-w-3xl text-xl leading-relaxed md:text-3xl"
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: DUR.reveal, delay: 0.85, ease: EASE_EXPO_OUT }}
        >
          <p>
            It&apos;s <span className="font-head tabular-nums">{time}</span> where you are. I&apos;m
            in{' '}
            <HoverTrigger
              spec={{ id: 'city', label: `${stats.location} city loop`, visual: { kind: 'image', src: '/img/Hyderabad.gif' } }}
            >
              {stats.location}
            </HoverTrigger>
            . Last song was{' '}
            <HoverTrigger
              spec={{
                id: 'song',
                label: `${stats.songName}, playing`,
                visual: { kind: 'image', src: '/img/gintamaBreakDancing.gif' },
                // resume:true — one continuous listen across hovers, not a
                // restart each time. This is the detail that sells it.
                audio: stats.songURL
                  ? { src: stats.songURL, volume: 0.5, resume: true }
                  : undefined,
              }}
            >
              {stats.songName}
            </HoverTrigger>
            , last game was{' '}
            <HoverTrigger
              spec={{ id: 'game', label: `${stats.game} clip`, visual: { kind: 'image', src: '/img/counterStrike2.gif' } }}
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
        </motion.div>

        {/* Honest about data provenance. A recruiter who opens DevTools and
            sees a failed request next to confident copy notices. */}
        <p className="font-mono mt-4 text-xs text-muted-foreground">
          {live === null
            ? 'checking live data…'
            : live
              ? 'live from /api/stats'
              : 'showing cached values — API unreachable'}
        </p>

        <nav aria-label="Primary" className="mt-12 flex flex-wrap gap-4">
          <a
            href="#work"
            className="retro-press font-head border-2 border-black bg-[var(--section-accent)] px-6 py-3 text-base text-white shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            See the work ↓
          </a>
          <a
            href={profile.resume}
            download
            className="retro-press font-head border-2 border-black bg-card px-6 py-3 text-base shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Résumé (PDF)
          </a>
        </nav>
      </div>
    </header>
  )
}
