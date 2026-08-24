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

  // Video follows the active overlay.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const spec = activeId ? specs.get(activeId) : null
    if (spec?.visual.kind === 'video') {
      video.currentTime = 0
      void video.play().catch(() => {})
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [activeId, specs])

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
   * The overlay follows the pointer.
   *
   * This is the site's signature interaction, and a panel parked in the middle
   * of the screen while the reader's attention is on a word in the sentence is
   * the version that reads as a modal rather than a response. Trailing the
   * cursor with a lag ties the image to the word that opened it.
   *
   * Three things it deliberately does:
   *   - writes `transform` in a rAF loop reading refs, never setState. A
   *     setState per pointermove re-renders the provider — and therefore the
   *     entire page beneath it — at pointer frequency.
   *   - clamps against the measured panel size so the media never leaves the
   *     viewport, measured ONCE per open rather than per frame.
   *   - falls back to dead-centre on touch and under reduced motion, where a
   *     pointer-chasing panel is either impossible or unwelcome.
   */
  const followRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const eased = useRef({ x: 0, y: 0 })
  const seeded = useRef(false)
  const reduceMotion = useReducedMotion()

  // One passive listener for the whole app, so the panel already knows where the
  // cursor is the instant it opens instead of flying in from the origin.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX
      pointer.current.y = e.clientY
      if (!seeded.current) {
        eased.current.x = e.clientX
        eased.current.y = e.clientY
        seeded.current = true
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    const el = followRef.current
    if (!el) return

    const centre = () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const chase = hasHover && !reduceMotion && Boolean(activeId)

    if (!chase) {
      const c = centre()
      el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%)`
      return
    }

    /**
     * Size, for the clamp. Not measured once: the effect runs before the browser
     * has painted the <img>, so at that moment the panel is genuinely 0x0 and a
     * clamp built on it would let a 46vw GIF run off the right edge.
     *
     * So it re-reads until the media reports a size, then stops. That is a
     * handful of layout reads at the start of an open, not one per frame for as
     * long as the overlay is up.
     */
    let halfW = 0
    let halfH = 0
    const margin = 16

    let frame = 0
    const tick = () => {
      if (halfW === 0 || halfH === 0) {
        const rect = el.getBoundingClientRect()
        halfW = rect.width / 2
        halfH = rect.height / 2
      }

      const targetX = Math.min(
        Math.max(pointer.current.x + halfW + 44, halfW + margin),
        window.innerWidth - halfW - margin,
      )
      // Nudged UP by a third of the plate height so it sits beside-and-above the
      // word rather than centred on it — a plate centred on the pointer covers
      // the line above and below the word you're actually reading.
      const targetY = Math.min(
        Math.max(pointer.current.y - halfH * 0.35, halfH + margin),
        window.innerHeight - halfH - margin,
      )
      // Exponential smoothing. The lag is the whole effect — an overlay locked
      // to the cursor reads as a bug in the cursor.
      eased.current.x += (targetX - eased.current.x) * 0.14
      eased.current.y += (targetY - eased.current.y) * 0.14
      el.style.transform = `translate3d(${eased.current.x}px, ${eased.current.y}px, 0) translate(-50%, -50%)`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [activeId, hasHover, reduceMotion])

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

  return (
    <HoverMediaContext.Provider value={value}>
      {children}
      {/* Single overlay surface. aria-live announces what opened, since the
          visual is decorative and conveys nothing to a screen reader. */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">{active ? `Showing ${active.label}` : ''}</span>
        {/* Positioned from the top-left origin and moved entirely by transform.
            Anchoring with left/top would force layout on every frame of the
            follow loop — the exact mistake PERFORMANCE_NOTES.md recorded on the
            previous site's cursor. */}
        <div ref={followRef} className="absolute top-0 left-0">
          {/* Scale and opacity live on THIS element, not the one above it: the
              follow loop owns the outer transform, and animating transform on
              the same node would have the two fighting frame by frame.

              A plate, not a floating image. The media sits in a bordered panel
              with a mono cutline under it, the way a figure in print does — which
              is what makes it read as a considered inset rather than something
              stuck to the cursor. Sized at ~30rem: the previous 34vh/46vw was
              small enough that on a 15" display it genuinely looked like part of
              the pointer. */}
          <figure
            aria-hidden="true"
            className={`w-fit border border-line-strong bg-paper-raised shadow-2xl transition-[opacity,transform] duration-[var(--dur-base)] ${
              active ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-0'
            }`}
          >
            {shown?.visual.kind === 'image' && (
              // No explicit width/height: this is a fixed, aria-hidden overlay,
              // not in-flow content, so it causes no layout shift, and the GIFs
              // are mixed aspect ratios that fixed dims would distort. object-
              // contain within the max box handles sizing; decoding async keeps
              // the first hover from blocking the main thread.
              <img
                src={shown.visual.src}
                alt=""
                decoding="async"
                className="block max-h-[38vh] max-w-[min(22rem,64vw)] object-contain"
              />
            )}
            {/* Always mounted so play() is never racing a mount. */}
            <video
              ref={videoRef}
              loop
              muted
              playsInline
              className={`max-h-[38vh] max-w-[min(22rem,64vw)] object-contain ${
                shown?.visual.kind === 'video' ? 'block' : 'hidden'
              }`}
            >
              {shown?.visual.kind === 'video' &&
                shown.visual.sources.map((s) => (
                  <source key={s.src} src={s.src} type={s.type} />
                ))}
            </video>

            <figcaption className="t-label flex items-baseline gap-3 border-t border-line px-3 py-2.5">
              <span className="text-accent">◆</span>
              {shown?.label}
            </figcaption>
          </figure>
        </div>
      </div>
    </HoverMediaContext.Provider>
  )
}
