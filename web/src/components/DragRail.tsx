import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { DUR, EASE_EXPO_OUT } from '@/lib/motion'

interface DragRailProps {
  children: ReactNode
  /** Shown once, as a hint. Miranda labels this "Drag sideways to navigate". */
  hint?: string
  ariaLabel: string
}

/**
 * Horizontal drag rail.
 *
 * Constraints are measured from the DOM and recomputed on resize, because
 * hardcoding a track width breaks the moment content or font metrics change.
 *
 * Accessibility is the part these carousels usually get wrong. Dragging is
 * pointer-only, so the rail is also a focusable scroll container with
 * overflow-x-auto: keyboard users get arrow keys and screen readers get a
 * labelled region. Motion drives x on pointer devices, native scroll handles
 * everything else — the two never fight because reduced-motion and
 * coarse-pointer users get the native path.
 */
export function DragRail({ children, hint, ariaLabel }: DragRailProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragLimit, setDragLimit] = useState(0)
  const [canDrag, setCanDrag] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current
      const track = trackRef.current
      if (!viewport || !track) return
      const overflow = track.scrollWidth - viewport.clientWidth
      setDragLimit(overflow > 0 ? overflow : 0)
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (viewportRef.current) ro.observe(viewportRef.current)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [children])

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setCanDrag(mq.matches && !reduceMotion)
    const onChange = (e: MediaQueryListEvent) => setCanDrag(e.matches && !reduceMotion)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [reduceMotion])

  return (
    <div className="relative">
      {hint && dragLimit > 0 && (
        <p className="font-pixel mb-4 text-[0.6rem] tracking-[0.25em] uppercase text-muted-foreground">
          {canDrag ? hint : 'Swipe to explore →'}
        </p>
      )}

      <div
        ref={viewportRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className={[
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black',
          // Native scroll is the baseline; dragging is layered on top for mice.
          canDrag ? 'overflow-hidden' : 'snap-x snap-mandatory overflow-x-auto',
        ].join(' ')}
      >
        <motion.div
          ref={trackRef}
          className="flex w-max items-stretch gap-6 md:gap-8"
          drag={canDrag && dragLimit > 0 ? 'x' : false}
          dragConstraints={{ left: -dragLimit, right: 0 }}
          // Elastic beyond the ends, then settle — the "weight" of the rail.
          dragElastic={0.08}
          dragTransition={{ power: 0.25, timeConstant: 260 }}
          whileDrag={{ cursor: 'grabbing' }}
          transition={{ duration: DUR.base, ease: EASE_EXPO_OUT }}
          style={{ cursor: canDrag && dragLimit > 0 ? 'grab' : undefined }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
