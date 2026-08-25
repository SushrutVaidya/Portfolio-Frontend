import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * The hover-media system behind the hero sentence.
 *
 * Replaces five near-identical mouseenter/mouseleave pairs plus a parallel
 * touch implementation (js/main.js:131-238 and :323-430) with one state
 * machine. Behaviours preserved deliberately:
 *
 *  - only one overlay is ever visible
 *  - the song track RESUMES rather than restarts (`resume: true`) — it's a
 *    single continuous listen across hovers, which is the whole conceit
 *  - the book ambience restarts and loops
 *  - on touch, tapping toggles and tapping outside dismisses
 *
 * Added here: triggers are real <button>s, so the sentence is keyboard
 * navigable and screen-reader announced. The original used bare <span>s with
 * mouse listeners, which made this content unreachable without a pointer.
 */

interface AudioSpec {
  src: string
  volume: number
  loop?: boolean
  /** Resume from the previous position instead of seeking to 0. */
  resume?: boolean
}

export type MediaSpec = {
  id: string
  /** Announced to assistive tech when the overlay opens. */
  label: string
  visual:
    | { kind: 'image'; src: string }
    | { kind: 'video'; sources: readonly { src: string; type: string }[] }
  audio?: AudioSpec
}

interface HoverMediaContextValue {
  activeId: string | null
  open: (id: string) => void
  close: (id: string) => void
  toggle: (id: string) => void
  register: (spec: MediaSpec) => void
  hasHover: boolean
}

const HoverMediaContext = createContext<HoverMediaContextValue | null>(null)

export function useHoverMediaContext() {
  const ctx = useContext(HoverMediaContext)
  if (!ctx)
    throw new Error('useHoverMediaContext must be used inside <HoverMediaProvider>')
  return ctx
}

export function HoverMediaProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [specs, setSpecs] = useState<Map<string, MediaSpec>>(new Map())
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map())
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Pointer capability, not screen width: a touch laptop has both, and a
  // width query would wrongly disable hover on small desktop windows.
  const [hasHover, setHasHover] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setHasHover(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setHasHover(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const register = useCallback((spec: MediaSpec) => {
    setSpecs((prev) => {
      if (prev.get(spec.id) === spec) return prev
      const next = new Map(prev)
      next.set(spec.id, spec)
      return next
    })
  }, [])

  const stopAllAudio = useCallback((except?: string) => {
    audioCache.current.forEach((el, id) => {
      if (id === except) return
      el.pause()
      // Only rewind non-resuming tracks; the song keeps its position.
      if (!el.dataset.resume) el.currentTime = 0
    })
  }, [])

  const playFor = useCallback(
    (id: string) => {
      const spec = specs.get(id)
      if (!spec?.audio) return
      let el = audioCache.current.get(id)
      if (!el) {
        el = new Audio(spec.audio.src)
        el.volume = spec.audio.volume
        el.loop = Boolean(spec.audio.loop)
        if (spec.audio.resume) el.dataset.resume = 'true'
        audioCache.current.set(id, el)
      }
      if (!spec.audio.resume) el.currentTime = 0
      // Autoplay can be refused before any user gesture — never throw for it.
      void el.play().catch(() => {})
    },
    [specs],
  )

  const open = useCallback(
    (id: string) => {
      stopAllAudio(id)
      setActiveId(id)
      playFor(id)
    },
    [playFor, stopAllAudio],
  )

  const close = useCallback((id: string) => {
    setActiveId((current) => (current === id ? null : current))
    const el = audioCache.current.get(id)
    if (el) {
      el.pause()
      if (!el.dataset.resume) el.currentTime = 0
    }
  }, [])

  const toggle = useCallback(
    (id: string) => {
      if (activeId === id) close(id)
      else open(id)
    },
    [activeId, close, open],
  )

  // Escape dismisses; tap outside dismisses on touch.
  useEffect(() => {
    if (!activeId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(activeId)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('[data-hover-trigger]')) close(activeId)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [activeId, close])

  // Release audio elements on unmount.
  useEffect(
    () => () => {
      audioCache.current.forEach((el) => el.pause())
      audioCache.current.clear()
    },
    [],
  )

  /**
   * The overlay is pinned to a fixed corner, not chased along the pointer.
   *
   * The "Now" sentence is set at full-viewport display scale, so a cursor-
   * following plate always landed on top of the very words being read — it read
   * as clutter rather than a response. A fixed picture-in-picture in the corner
   * pops up in one predictable place, clear of the type, and reads as an
   * intentional preview dock. Positioning is pure CSS (see the overlay markup),
   * so there is no per-frame layout work.
   */

  const value = useMemo(
    () => ({ activeId, open, close, toggle, register, hasHover }),
    [activeId, open, close, toggle, register, hasHover],
  )

  const active = activeId ? specs.get(activeId) : null

  /**
   * The last thing shown, retained after close.
   *
   * `active` goes null the instant the pointer leaves, so rendering the media
   * from it meant the image unmounted immediately and the 500ms fade-out played
   * over an empty box — the overlay appeared to vanish rather than dismiss.
   * `shown` keeps the media and its caption mounted through the fade.
   */
  const [shown, setShown] = useState<MediaSpec | null>(null)
  useEffect(() => {
    if (active) setShown(active)
  }, [active])

  // Play the book clip, but keyed on `shown` — the state that actually drives
  // the <source> children — not on `active`, which leads it by a render. Keying
  // on `active` fired play() against stale/absent sources and never retried, so
  // the video usually never started. load() ensures the current source set is
  // picked up; gated on reduced-motion so it doesn't autoplay when unwelcome.
  const reduceMotion = useReducedMotion()
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (activeId && shown?.visual.kind === 'video' && !reduceMotion) {
      video.load()
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [activeId, shown, reduceMotion])

  // One persistent <video> (play() must never race a mount); mediaClass sizes it.
  const media = (mediaClass: string) => (
    <>
      {shown?.visual.kind === 'image' && (
        <img src={shown.visual.src} alt="" decoding="async" className={mediaClass} />
      )}
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        className={`${mediaClass} ${shown?.visual.kind === 'video' ? 'block' : 'hidden'}`}
      >
        {shown?.visual.kind === 'video' &&
          shown.visual.sources.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
      </video>
    </>
  )

  return (
    <HoverMediaContext.Provider value={value}>
      {children}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {active ? `Showing ${active.label}` : ''}
      </span>

      {/* Full-bleed backdrop: the media fills the section behind the text. It is
          scaled + softly blurred (the source GIFs are small, so a hard object-
          cover would pixelate) and veiled in cream so the display type stays
          legible over any frame. -z-10 keeps it above the page ground but behind
          the in-flow sentence. A slow ken-burns drift keeps it alive. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-opacity duration-[var(--dur-smooth)] ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {media('nowbg-media h-full w-full scale-110 object-cover blur-[2px]')}
        {/* Cream veil, a touch heavier top and bottom so the type reads no matter
            which line it lands on. Mid-band kept high enough that a dark clip
            frame (e.g. gameplay) can't drop the display text below ~3:1. */}
        <div className="absolute inset-0 bg-gradient-to-b from-paper/80 via-paper/68 to-paper/82" />
        <span className="t-label absolute bottom-6 left-6 rounded-full border-2 border-line-strong bg-paper-raised px-3 py-1.5">
          <span className="text-accent">◆</span> {shown?.label}
        </span>
      </div>
    </HoverMediaContext.Provider>
  )
}
