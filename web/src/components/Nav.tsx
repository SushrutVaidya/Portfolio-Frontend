import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react'
import { chapters } from '@/content/chapters'
import { useActiveChapter } from '@/hooks/useActiveChapter'
import { useLiveClock } from '@/hooks/useLiveClock'
import { links, profile } from '@/content/site'
import { lockScroll, scrollToId, unlockScroll } from '@/lib/scroll'
import { DUR, EASE, STAGGER_STEP } from '@/lib/motion'

const EXTERNAL = [
  { label: 'GitHub', href: links.github },
  { label: 'LinkedIn', href: links.linkedin },
  { label: 'Steam', href: links.steam },
] as const

/**
 * Navigation.
 *
 * Not a navbar. A conventional nav — logo left, five links right — would have
 * been the one generic element on the page, and it also can't hold six chapters
 * plus five external links without becoming a soup of small text.
 *
 * What this is instead:
 *
 *   1. A hairline bar carrying only three things: the monogram, a live folio
 *      readout of the chapter you're currently inside, and one trigger. The
 *      folio is the concept in miniature — the navigation reads the page's
 *      state rather than describing it.
 *   2. A scroll-progress hairline welded to the top edge. On a page of
 *      full-height frames this is the only cheap orientation cue there is.
 *   3. A full-screen chapter register, opened from that trigger, where each
 *      chapter is set at display scale and hovering one recedes the rest.
 *
 * The bar retreats when you scroll down and returns when you scroll up, so it
 * is absent while you're reading and present the moment you look for it.
 */
export function Nav() {
  const [open, setOpen] = useState(false)
  const [retracted, setRetracted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const active = useActiveChapter()
  const reduceMotion = useReducedMotion()

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()
  // Spring on the progress bar only. Raw scrollYProgress under Lenis is already
  // interpolated, but the bar reads the *document* progress, which jumps on
  // resize and on route change; the spring absorbs that.
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.25,
  })

  /* Retract on scroll down, return on scroll up. Threshold of 8px so a
     trackpad's sub-pixel jitter doesn't flap the bar. */
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      if (Math.abs(y - last) > 8) {
        setRetracted(y > last && y > 160)
        last = y
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  /* Scroll lock, Escape, and a focus trap — all three only while open. */
  useEffect(() => {
    if (!open) return
    lockScroll()

    // Captured now rather than read in the cleanup: by teardown the ref may
    // already point somewhere else, and focus would land on nothing.
    const trigger = triggerRef.current
    const panel = panelRef.current
    const focusables = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
      : []
    focusables[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key !== 'Tab' || focusables.length === 0) return
      // Trap: an overlay you can Tab out of leaves keyboard users navigating
      // a page they can't see.
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      unlockScroll()
      // Return focus to the trigger, or a keyboard user is left with focus on
      // an element that no longer exists.
      trigger?.focus()
    }
  }, [open, close])

  /* Close on route change — otherwise following a project link leaves the
     overlay covering the page it just navigated to. */
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const goToChapter = (id: string) => {
    setOpen(false)
    if (pathname === '/') {
      scrollToId(id)
    } else {
      // Home reads location.hash on mount and scrolls there.
      navigate(`/#${id}`)
    }
  }

  const activeChapter = chapters.find((c) => c.id === active)

  return (
    <>
      {/* ─── The bar ─────────────────────────────────────────────── */}
      <motion.header
        className={[
          'fixed top-0 left-0 z-180 w-full',
          // Solid ground rather than a backdrop blur: blur over a full-bleed
          // dark composition costs a compositor layer for an effect nobody
          // can see, and glassmorphism is the AI-portfolio house style.
          scrolled && !open ? 'border-b border-line bg-paper' : '',
        ].join(' ')}
        // Never retracts under reduced motion: a bar sliding the full height of
        // itself is exactly the kind of large moving surface that setting exists
        // to suppress, and Motion's JS animations are not covered by the
        // transition-duration override in index.css.
        animate={{ y: retracted && !open && !reduceMotion ? '-100%' : '0%' }}
        transition={{ duration: DUR.base, ease: EASE }}
      >
        {/* Progress hairline, welded to the very top edge. */}
        {!reduceMotion && (
          <motion.div
            aria-hidden="true"
            className="absolute top-0 left-0 h-px w-full origin-left bg-accent"
            style={{ scaleX: progress }}
          />
        )}

        <div className="flex h-16 items-center justify-between px-6 sm:px-10 lg:px-16">
          <div className="flex items-baseline gap-6">
            <Link
              to="/"
              className="font-display text-xl leading-none tracking-tight transition-colors hover:text-accent"
              aria-label={`${profile.name} — home`}
            >
              SV
            </Link>

            {/* The live folio. Present only once you're inside a chapter, so
                it never sits there empty on the cover. */}
            <AnimatePresence mode="wait">
              {activeChapter && (
                <motion.span
                  key={activeChapter.id}
                  className="t-label hidden sm:block"
                  initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: DUR.fast, ease: EASE }}
                >
                  <span className="text-accent">{activeChapter.index}</span>
                  <span className="mx-2 text-ink-faint">/</span>
                  {activeChapter.title}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="chapter-register"
            className="group t-label z-10 flex items-center gap-3 py-2 text-ink transition-colors hover:text-accent"
          >
            {open ? 'Close' : 'Index'}
            <span aria-hidden="true" className="relative block h-3 w-4">
              {/* Two hairlines that cross into an X. Cheaper and quieter than
                  a hamburger, and the state change is unambiguous. */}
              <motion.span
                className="absolute left-0 block h-px w-4 bg-current"
                animate={open ? { top: 6, rotate: 45 } : { top: 2, rotate: 0 }}
                transition={{ duration: DUR.fast, ease: EASE }}
              />
              <motion.span
                className="absolute left-0 block h-px w-4 bg-current"
                animate={open ? { top: 6, rotate: -45 } : { top: 10, rotate: 0 }}
                transition={{ duration: DUR.fast, ease: EASE }}
              />
            </span>
          </button>
        </div>
      </motion.header>

      {/* ─── The chapter register ────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="chapter-register"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Chapter register"
            // overflow-y-auto, not justify-end: six rows at display scale plus
            // the footer overruns a 13" laptop viewport, and a flex container
            // with justify-end clips the TOP of overflowing content — the part
            // that scrolling cannot get back. mt-auto on the inner wrapper keeps
            // the bottom-anchored composition when it does fit.
            className="fixed inset-0 z-170 flex flex-col overflow-y-auto overscroll-contain bg-paper-deep px-6 pt-24 pb-10 sm:px-10 lg:px-16"
            initial={reduceMotion ? { opacity: 0 } : { y: '-100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: '0%' }}
            exit={reduceMotion ? { opacity: 0 } : { y: '-100%' }}
            transition={{ duration: DUR.smooth, ease: EASE }}
          >
            <div className="mt-auto w-full">
              <PanelClock />

              <nav aria-label="Chapters" className="w-full">
                {/* `register` / `register-row` are real CSS in index.css, not
                  Tailwind variants: the sibling-dimming effect needs two rules
                  in a guaranteed specificity order, and variant sort order is
                  not something to bet a hover state on. */}
                <ul className="register w-full border-t border-line">
                  {chapters.map((chapter, i) => (
                    <motion.li
                      key={chapter.id}
                      className="register-row border-b border-line"
                      initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{
                        duration: DUR.smooth,
                        ease: EASE,
                        delay: 0.12 + i * (STAGGER_STEP * 0.5),
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => goToChapter(chapter.id)}
                        className="group/row flex w-full items-baseline gap-6 py-3 text-left lg:gap-10"
                      >
                        <span className="t-label shrink-0 transition-colors group-hover/row:text-accent">
                          {chapter.index}
                        </span>
                        {/* The type steps toward the reader on hover rather than
                          changing colour — movement reads as responsive where a
                          colour flip reads as a default link state. */}
                        <span className="t-display block transition-transform duration-[var(--dur-base)] group-hover/row:translate-x-3">
                          {chapter.title}
                        </span>
                        <span className="t-label ml-auto hidden shrink-0 self-end pb-2 xl:block">
                          {chapter.note}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Foot of the panel: the address, then everywhere else. */}
              <motion.div
                className="mt-14 flex flex-col gap-8 border-t border-line pt-8 lg:flex-row lg:items-end lg:justify-between"
                initial={reduceMotion ? undefined : { opacity: 0 }}
                animate={reduceMotion ? undefined : { opacity: 1 }}
                transition={{ duration: DUR.base, ease: EASE, delay: 0.5 }}
              >
                <a href={`mailto:${profile.email}`} className="t-heading rule-in-thick">
                  {profile.email}
                </a>

                <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  {EXTERNAL.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="t-label rule-in"
                      >
                        {l.label} ↗
                      </a>
                    </li>
                  ))}
                  <li>
                    <a href={profile.resume} download className="t-label rule-in">
                      Résumé ↓
                    </a>
                  </li>
                  <li>
                    <a href={links.devquest} className="t-label rule-in">
                      DevQuest ↗
                    </a>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Split out so the 1Hz clock tick re-renders one line rather than the whole
 * overlay — including six list items mid-stagger.
 *
 * Sits in the flow above the register rather than absolutely in the top-right
 * corner, where it would have landed underneath the Close trigger.
 */
function PanelClock() {
  const time = useLiveClock()
  return (
    <p aria-hidden="true" className="t-label mb-6 w-full text-right">
      {profile.location} · <span className="tabular-nums">{time}</span>
    </p>
  )
}
