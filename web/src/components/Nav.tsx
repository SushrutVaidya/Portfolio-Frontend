import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react'
import { chapters } from '@/content/chapters'
import { elsewhere, profile } from '@/content/site'
import { Swap } from '@/components/Swap'
import { lockScroll, scrollToId, unlockScroll } from '@/lib/scroll'
import { DUR, EASE, STAGGER_STEP } from '@/lib/motion'

// One source with the contact frame. The two lists were maintained separately
// and had already diverged (the register was missing DevQuest and the resume).
// The rickroll is filtered out: a prank belongs on the closing frame, not in
// navigation someone is using to get somewhere.
const DESTINATIONS = elsewhere.filter((l) => !l.rickroll)

/**
 * Navigation.
 *
 * A hairline bar carrying two things: the monogram and one trigger. No live
 * "current chapter" readout, no clock, no locale strip - those margin readouts
 * were the site's densest cluster of AI-portfolio tells, so the bar now just
 * gets you around. Chapter numbers live in exactly one place: the register that
 * opens from the trigger.
 *
 * A scroll-progress hairline is welded to the top edge; on a page of full-height
 * frames it is the one cheap orientation cue worth keeping. The bar retreats on
 * scroll-down and returns on scroll-up, so it is absent while reading and there
 * the moment you look for it.
 */
export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.25,
  })

  /* Just a solid-background flag once you leave the top; the bar itself no
     longer retracts. Driven off Motion's scrollY (rAF-batched, no layout
     reads), and setState only flips once at the threshold. */
  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 24)
  })

  const close = useCallback(() => setOpen(false), [])

  /* Scroll lock, Escape, and a focus trap - all three only while open. */
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

  /* Close on route change - otherwise following a project link leaves the
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

  return (
    <>
      {/* ─── The bar ─────────────────────────────────────────────── */}
      {/* Always visible: a plain <header>, not a retracting one. The bar used to
          slide away on scroll-down, which read as the nav "vanishing"; keeping
          it fixed and static is calmer and means Index is always one click
          away. Solid ground once scrolled so it never sits over content. */}
      <header
        className={[
          'fixed top-0 left-0 z-180 w-full transition-colors duration-[var(--dur-base)]',
          scrolled && !open ? 'border-b-2 border-line-strong bg-paper' : '',
        ].join(' ')}
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
          <Link
            to="/"
            className="font-display text-xl leading-none tracking-tight transition-colors hover:text-accent"
            aria-label={`${profile.name}, home`}
          >
            SV
          </Link>

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
      </header>

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
            // with justify-end clips the TOP of overflowing content - the part
            // that scrolling cannot get back. mt-auto on the inner wrapper keeps
            // the bottom-anchored composition when it does fit.
            className="fixed inset-0 z-170 flex flex-col overflow-y-auto overscroll-contain bg-paper-deep px-6 pt-24 pb-10 sm:px-10 lg:px-16"
            // The register is a dark colour-block over the cream page. Ink is
            // dark by default now, so re-scope the ink/line vars to light here
            // or every chapter title renders dark-on-dark and vanishes.
            style={
              {
                '--ink': '#f4f2ea',
                '--ink-muted': '#b3ada0',
                '--ink-faint': '#6d685c',
                '--line': 'rgb(244 242 234 / 0.16)',
                '--line-strong': '#f4f2ea',
                '--paper-raised': '#2a2723',
                color: 'var(--ink)',
              } as CSSProperties
            }
            initial={reduceMotion ? { opacity: 0 } : { y: '-100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: '0%' }}
            exit={reduceMotion ? { opacity: 0 } : { y: '-100%' }}
            transition={{ duration: DUR.smooth, ease: EASE }}
          >
            <div className="mt-auto w-full">
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
                          changing colour: movement reads as responsive where a
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

                <ul className="flex flex-wrap items-center gap-x-9 gap-y-4">
                  {DESTINATIONS.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.external
                          ? { target: '_blank', rel: 'noreferrer noopener' }
                          : {})}
                        {...(link.download ? { download: true } : {})}
                        className="group/swap flex items-baseline gap-2"
                      >
                        <Swap className="t-label">{link.label}</Swap>
                        <span aria-hidden="true" className="t-label">
                          {link.download ? '↓' : link.external ? '↗' : '→'}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
