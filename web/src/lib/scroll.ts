import type Lenis from 'lenis'

/**
 * Scroll control, as a module singleton.
 *
 * The problem this solves: Lenis listens on window, so any overlay that locks
 * scroll with `body { overflow: hidden }` still scrolls the page underneath —
 * the wheel event never reaches the body. The preloader and the navigation
 * overlay both need a real lock, and neither of them sits in a position to hold
 * the Lenis instance.
 *
 * So SmoothScroll registers the instance here on mount and clears it on
 * unmount, and anything that needs to freeze the page calls lockScroll(). Nested
 * locks are counted rather than boolean, otherwise the nav overlay closing while
 * the preloader is still up would release a lock it didn't take.
 */

let lenis: Lenis | null = null
let locks = 0

export function registerLenis(instance: Lenis | null): void {
  lenis = instance
}

export function lockScroll(): void {
  locks += 1
  if (locks > 1) return
  lenis?.stop()
  document.documentElement.style.overflow = 'hidden'
}

export function unlockScroll(): void {
  locks = Math.max(0, locks - 1)
  if (locks > 0) return
  lenis?.start()
  document.documentElement.style.overflow = ''
}

/**
 * Eased scroll to an element id. Falls back to native when Lenis isn't running,
 * which is the case under prefers-reduced-motion.
 */
export function scrollToId(id: string): void {
  const target = document.getElementById(id)
  if (!target) return
  if (lenis) lenis.scrollTo(target, { offset: 0 })
  else target.scrollIntoView({ behavior: 'auto', block: 'start' })
}
