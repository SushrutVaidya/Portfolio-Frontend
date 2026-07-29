import { useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_EXPO_OUT } from '@/lib/motion'

interface MagneticProps {
  children: ReactNode
  /** How far the element is allowed to travel toward the pointer, in px. */
  strength?: number
  className?: string
}

/**
 * Magnetic hover.
 *
 * The element leans toward the cursor while it's nearby, then springs back on
 * exit. It's the interaction that makes buttons on Miranda/Skiper-class sites
 * feel physical rather than styled.
 *
 * Offset is derived from the pointer's position relative to the element's own
 * centre, normalised to ±1, so the pull is proportional and consistent
 * regardless of element size. Movement is capped by `strength` because an
 * unbounded follow feels broken rather than responsive.
 *
 * Only transform is animated, so this never triggers layout.
 */
export function Magnetic({ children, strength = 10, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ display: 'inline-block' }}
      animate={{ x: offset.x, y: offset.y }}
      transition={
        // Springy on the way back, immediate while tracking — a single tween
        // for both makes the follow feel laggy.
        offset.x === 0 && offset.y === 0
          ? { type: 'spring', stiffness: 260, damping: 18, mass: 0.6 }
          : { duration: 0.18, ease: EASE_EXPO_OUT }
      }
      onPointerMove={(e) => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
        const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
        setOffset({
          x: Math.max(-1, Math.min(1, dx)) * strength,
          y: Math.max(-1, Math.min(1, dy)) * strength,
        })
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </motion.div>
  )
}
