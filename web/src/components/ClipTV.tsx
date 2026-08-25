import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { DUR, EASE } from '@/lib/motion'

/**
 * The TV: a channel-flipping player over the real recovered clips.
 *
 * These are the actual gameplay/anime clips that used to live on the backend
 * (served at /clips), recovered from the GCP tar and transcoded to tight 45s
 * web loops. They sit in the frontend's /img/clips so the whole thing is served
 * without a backend rebuild.
 *
 * Each channel holds two clips. A stories-style segmented bar across the top of
 * the screen shows both: the playing segment fills with the clip's real
 * progress, finished segments stay full, and tapping a segment jumps to it. It
 * auto-advances to the next clip and loops the pair. Only the ACTIVE clip is
 * mounted, so one file streams at a time (progressive playback via faststart).
 * Audio ships in the files but the TV starts muted, because autoplay only
 * survives muted; a speaker toggle turns it on per the usual gesture rules.
 */

type Channel = { label: string; clips: [string, string] }

const BASE = '/img/clips'
const CHANNELS: Channel[] = [
  { label: 'Space Marine 2', clips: [`${BASE}/spacemarine2.mp4`, `${BASE}/spacemarine2-b.mp4`] },
  { label: 'Counter-Strike 2', clips: [`${BASE}/counterstrike2.mp4`, `${BASE}/counterstrike2-b.mp4`] },
  { label: 'GTA V', clips: [`${BASE}/gtav.mp4`, `${BASE}/gtav-b.mp4`] },
  { label: 'Doom', clips: [`${BASE}/doom.mp4`, `${BASE}/doom-b.mp4`] },
  { label: 'Gintama', clips: [`${BASE}/gintama.mp4`, `${BASE}/gintama-b.mp4`] },
  { label: 'Family Guy', clips: [`${BASE}/familyguy.mp4`, `${BASE}/familyguy-b.mp4`] },
]

const ch2 = (n: number) => String(n + 1).padStart(2, '0')

export function ClipTV() {
  const [active, setActive] = useState(0)
  const [clip, setClip] = useState(0)
  const [progress, setProgress] = useState(0)
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const reduceMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)
  // Under reduced motion, don't autoplay or auto-advance: start paused and let
  // the viewer press play (WCAG 2.2.2 / prefers-reduced-motion).
  useEffect(() => {
    if (reduceMotion) setPaused(true)
  }, [reduceMotion])

  const current = CHANNELS[active]
  const src = current.clips[clip]

  // Every clip change resets the fill so the stories bar restarts cleanly.
  function goClip(i: number) {
    setClip(i)
    setProgress(0)
  }

  function selectChannel(i: number) {
    setActive(i)
    goClip(0)
  }

  function onTimeUpdate() {
    const el = videoRef.current
    if (el?.duration) setProgress(el.currentTime / el.duration)
  }

  // At the end of a clip, advance to the channel's next and loop the pair —
  // but only while playing (a paused/reduced-motion clip never fires this).
  function onEnded() {
    if (paused) return
    goClip((clip + 1) % current.clips.length)
  }

  function togglePlay() {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      void el.play().catch(() => {})
      setPaused(false)
    } else {
      el.pause()
      setPaused(true)
    }
  }

  function toggleSound() {
    const el = videoRef.current
    if (!el) return
    const next = !muted
    setMuted(next)
    el.muted = next
    // Unmuting is the user gesture, so a stalled clip can resume with sound —
    // unless it's been explicitly paused.
    if (!next && !paused) void el.play().catch(() => {})
  }

  return (
    <div className="card-pop overflow-hidden bg-paper-deep">
      {/* Bezel header */}
      <div className="flex items-center gap-2.5 border-b-2 border-line-strong bg-paper-raised px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full border border-line-strong bg-red" />
          <span className="h-3 w-3 rounded-full border border-line-strong bg-yellow" />
          <span className="h-3 w-3 rounded-full border border-line-strong bg-green" />
        </span>
        <span className="t-label text-ink">
          CH {ch2(active)} · {current.label}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={paused ? 'Play the TV' : 'Pause the TV'}
            aria-pressed={!paused}
            className="t-label rounded-full border-2 border-line-strong bg-paper px-3 py-1 text-ink transition-transform hover:-translate-y-0.5"
          >
            {paused ? '▶ play' : '❚❚ pause'}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? 'Unmute the TV' : 'Mute the TV'}
            className="t-label rounded-full border-2 border-line-strong bg-paper px-3 py-1 text-ink transition-transform hover:-translate-y-0.5"
          >
            {muted ? '🔇 muted' : '🔊 sound'}
          </button>
        </div>
      </div>

      {/* Screen: only the active clip is mounted, so one file streams. */}
      <div className="relative aspect-video w-full bg-black">
        <AnimatePresence mode="wait">
          <motion.video
            key={src}
            ref={videoRef}
            muted={muted}
            autoPlay={!paused}
            playsInline
            preload="metadata"
            onTimeUpdate={onTimeUpdate}
            onEnded={onEnded}
            aria-label={`${current.label} clip ${clip + 1}`}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.fast, ease: EASE }}
          >
            <source src={src} type="video/mp4" />
          </motion.video>
        </AnimatePresence>

        {/* Stories-style segmented progress: one bar per clip. The visible track
            stays 6px but the button is 24px tall for an accessible tap target. */}
        <div className="absolute inset-x-3 top-2 z-10 flex gap-1.5">
          {current.clips.map((c, i) => (
            <button
              key={c}
              type="button"
              onClick={() => goClip(i)}
              aria-label={`Play clip ${i + 1} of ${current.clips.length}`}
              className="group flex h-6 flex-1 items-center"
            >
              <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/25 transition-transform group-hover:scale-y-150">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: i < clip ? '100%' : i === clip ? `${progress * 100}%` : '0%' }}
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Channel dial */}
      <div className="flex flex-wrap gap-2 border-t-2 border-line-strong bg-paper-raised p-3">
        {CHANNELS.map((c, i) => {
          const on = i === active
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => selectChannel(i)}
              aria-pressed={on}
              aria-label={`Channel ${ch2(i)}: ${c.label}`}
              className={`t-label rounded-full border-2 border-line-strong px-3 py-1.5 transition-transform hover:-translate-y-0.5 ${
                on ? 'bg-accent text-accent-ink' : 'bg-paper text-ink'
              }`}
            >
              {ch2(i)} · {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
