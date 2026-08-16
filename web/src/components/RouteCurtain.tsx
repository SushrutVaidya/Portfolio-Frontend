import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { EASE } from '@/lib/motion'

/**
 * Route-change curtain.
 *
 * A crossfade between routes reads as a flicker. A panel that sweeps in, covers,
 * then sweeps out gives the navigation weight and — more usefully — hides the
 * scroll reset and first paint of the incoming route behind an opaque surface.
 *
 * Driven off pathname rather than wrapping the router: the curtain plays over
 * whatever is mounted, so it never has to coordinate with route unmounting.
 *
 * Suppressed under reduced motion, where a covering panel is exactly the kind of
 * large moving surface that setting exists to prevent.
 */
export function RouteCurtain() {
  const { pathname } = useLocation()
  const [playing, setPlaying] = useState(false)
  const [first, setFirst] = useState(true)

  useEffect(() => {
    if (first) {
      setFirst(false)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    setPlaying(true)
    const timer = window.setTimeout(() => setPlaying(false), 620)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-190 flex items-center justify-center bg-ink"
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.6, ease: EASE }}
          aria-hidden="true"
        >
          <span className="t-label text-paper">
            Sushrut Vaidya
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
