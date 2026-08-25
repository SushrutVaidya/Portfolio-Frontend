import { useMemo } from 'react'
import { Corner, Frame, Grid, col } from '@/components/layout/Frame'
import { HoverTrigger } from '@/components/HoverTrigger'
import { Reveal } from '@/components/Reveal'
import { useLiveClock } from '@/hooks/useLiveClock'
import { useStats } from '@/hooks/useStats'

/**
 * 01 — Now.
 *
 * The only genuinely live content on the site, so it gets a whole viewport
 * rather than being tucked under the name. Five values come off /api/stats and
 * each one is an inline trigger: hover reveals a GIF or a clip, and the song
 * keeps playing from where it left off across separate hovers rather than
 * restarting — one continuous listen, which is the whole conceit.
 *
 * Two composition decisions worth naming:
 *
 *   - the frame is offset into the right-hand columns, because two consecutive
 *     full-height frames with content in the same place read as one long column
 *     no matter what's in them
 *   - the provenance line in the bottom margin is NOT decorative and is not
 *     aria-hidden. A reader who opens DevTools, sees a failed /api/stats and
 *     then reads confident copy above it has caught the site lying. Saying
 *     "cached · api unreachable" costs nothing and buys everything.
 */
export function Now() {
  const { stats, live } = useStats()
  const time = useLiveClock()

  // Memoised so the once-a-minute clock re-render doesn't recreate these object
  // literals. Unstable spec references re-register every tick, which churns the
  // provider's spec map and restarts an open video overlay (audit finding).
  const citySpec = useMemo(
    () => ({
      id: 'city',
      label: `${stats.location} city loop`,
      visual: { kind: 'image' as const, src: '/img/Hyderabad.gif' },
    }),
    [stats.location],
  )
  const songSpec = useMemo(
    () => ({
      id: 'song',
      label: `${stats.songName}, playing`,
      visual: { kind: 'image' as const, src: '/img/gintamaBreakDancing.gif' },
      audio: stats.songURL ? { src: stats.songURL, volume: 0.5, resume: true } : undefined,
    }),
    [stats.songName, stats.songURL],
  )
  const gameSpec = useMemo(
    () => ({
      id: 'game',
      label: `${stats.game} clip`,
      visual: { kind: 'image' as const, src: '/img/counterStrike2.gif' },
    }),
    [stats.game],
  )
  const bookSpec = useMemo(
    () => ({
      id: 'book',
      label: `${stats.bookName ?? 'this book'}, with crickets`,
      visual: {
        kind: 'video' as const,
        sources: [
          { src: '/img/study.mov', type: 'video/mp4; codecs="hvc1"' },
          { src: '/img/study.mp4', type: 'video/mp4' },
        ],
      },
      audio: { src: '/img/crickets.mp3', volume: 0.3, loop: true },
    }),
    [stats.bookName],
  )

  return (
    <Frame full rule id="now" aria-labelledby="now-heading">
      <Grid>
        <h2 id="now-heading" className="sr-only">
          Right now
        </h2>

        <div className={col.wide}>
          <span className="t-label text-accent">Now</span>
        </div>

        <Reveal className={`${col.wide} mt-4`} distance={16}>
          <p className="t-display">
            It&apos;s <span className="tabular-nums italic text-accent">{time}</span> where you
            are. I&apos;m in{' '}
            <HoverTrigger spec={citySpec} punct=",">
              {stats.location}
            </HoverTrigger>{' '}
            the last song was{' '}
            <HoverTrigger spec={songSpec} punct=",">
              {stats.songName}
            </HoverTrigger>{' '}
            the last game was{' '}
            <HoverTrigger spec={gameSpec} punct=",">
              {stats.game}
            </HoverTrigger>{' '}
            and I&apos;m reading{' '}
            <HoverTrigger spec={bookSpec} punct=".">
              {stats.bookName ?? 'this book'}
            </HoverTrigger>
          </p>
        </Reveal>

        <Reveal className={`${col.right} mt-2`} delay={0.1}>
          <p className="t-body max-w-sm text-ink-muted">
            Four of those five come off a Spring Boot API on the same host, cached in
            Redis. Hover any of them.
          </p>
        </Reveal>
      </Grid>

      <Corner at="bottom-left" decorative={false}>
        {live === null ? 'checking…' : live ? 'live · /api/stats' : 'cached · api unreachable'}
      </Corner>
    </Frame>
  )
}
