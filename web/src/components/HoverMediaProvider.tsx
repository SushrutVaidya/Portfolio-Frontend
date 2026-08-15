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
  if (!ctx) throw new Error('useHoverMediaContext must be used inside <HoverMediaProvider>')
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
    [specs]
  )

  const open = useCallback(
    (id: string) => {
      stopAllAudio(id)
      setActiveId(id)
      playFor(id)
    },
    [playFor, stopAllAudio]
  )

  const close = useCallback(
    (id: string) => {
      setActiveId((current) => (current === id ? null : current))
      const el = audioCache.current.get(id)
      if (el) {
        el.pause()
        if (!el.dataset.resume) el.currentTime = 0
      }
    },
    []
  )

  const toggle = useCallback(
    (id: string) => {
      if (activeId === id) close(id)
      else open(id)
    },
    [activeId, close, open]
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
    []
  )

  const value = useMemo(
    () => ({ activeId, open, close, toggle, register, hasHover }),
    [activeId, open, close, toggle, register, hasHover]
  )

  const active = activeId ? specs.get(activeId) : null

  return (
    <HoverMediaContext.Provider value={value}>
      {children}
      {/* Single overlay surface. aria-live announces what opened, since the
          visual is decorative and conveys nothing to a screen reader. */}
      <div
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">{active ? `Showing ${active.label}` : ''}</span>
        <div
          className={`transition-opacity duration-[var(--dur-base)] ${
            active ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {active?.visual.kind === 'image' && (
            <img
              src={active.visual.src}
              alt=""
              aria-hidden="true"
              className="max-h-[42vh] max-w-[80vw] border border-line-strong object-contain shadow-2xl"
            />
          )}
          {/* Video element is always mounted so play() isn't racing a mount. */}
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            aria-hidden="true"
            className={`max-h-[42vh] max-w-[80vw] border border-line-strong object-contain shadow-2xl ${
              active?.visual.kind === 'video' ? 'block' : 'hidden'
            }`}
          >
            {active?.visual.kind === 'video' &&
              active.visual.sources.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
          </video>
        </div>
      </div>
    </HoverMediaContext.Provider>
  )
}
