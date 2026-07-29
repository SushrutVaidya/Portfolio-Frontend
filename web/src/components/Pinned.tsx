import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

interface PinnedProps {
  /** Sticky column — the heading that holds while content moves past it. */
  aside: ReactNode
  children: ReactNode
}

/**
 * Pinned two-column layout.
 *
 * The device from niccolomiranda.com: display type holds position while the
 * content scrolls past, so a section reads as one composition rather than a
 * stack of blocks.
 *
 * Implemented with CSS `position: sticky` rather than scroll-driven transforms.
 * Sticky is handled by the compositor and cannot desync from scroll; a
 * transform-based pin has to be recalculated every frame and drifts under
 * momentum scrolling. The scroll progress here only drives a subtle opacity
 * fade, which is cheap and non-structural.
 *
 * Collapses to a single column below `md`, where pinning has no room to work.
 */
export function Pinned({ aside, children }: PinnedProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.6', 'end 0.4'],
  })
  // Fades out only as the section leaves, so it never dims while being read.
  const opacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 1, 0.25])

  return (
    <div ref={ref} className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16">
      <motion.div
        className="md:sticky md:top-24 md:self-start"
        style={reduceMotion ? undefined : { opacity }}
      >
        {aside}
      </motion.div>
      <div>{children}</div>
    </div>
  )
}
