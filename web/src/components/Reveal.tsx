import { motion, useReducedMotion } from 'motion/react'
import { DUR, EASE_EXPO_OUT } from '@/lib/motion'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  /** Travel distance in px. Larger for display type, smaller for body. */
  distance?: number
  className?: string
}

/**
 * Scroll-triggered reveal — the workhorse, replacing the .fade-in
 * IntersectionObserver at js/main.js:301.
 *
 * `once: true` matters: re-animating on every scroll-past is the tell of an
 * unconsidered implementation, and it makes long pages feel restless.
 *
 * When prefers-reduced-motion is set, content renders immediately with no
 * wrapper animation. Note this must return visible content, not skip the
 * element — a reduced-motion user should see everything, just not the movement.
 */
export function Reveal({ children, delay = 0, distance = 24, className }: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: DUR.reveal, ease: EASE_EXPO_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}
