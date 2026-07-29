import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * Custom cursor.
 *
 * A dot that trails the pointer and swells over interactive elements. Two
 * decisions worth noting, both from the previous site's PERFORMANCE_NOTES.md
 * findings on this exact component:
 *
 *  - position is written via transform, never left/top, because left/top
 *    triggers layout on every mousemove
 *  - the position update runs in a rAF loop reading a ref, not React state; a
 *    setState per mousemove would re-render the tree at pointer frequency
 *
 * Only mounts on fine-pointer devices — a trailing dot on touch is dead weight,
 * and it's suppressed under prefers-reduced-motion.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const [enabled, setEnabled] = useState(false)
  const [hot, setHot] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setEnabled(mq.matches && !reduceMotion)
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches && !reduceMotion)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [reduceMotion])

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      const el = e.target as HTMLElement
      setHot(Boolean(el.closest('a, button, [data-hover-trigger], [role="button"]')))
    }

    let frame = 0
    const tick = () => {
      // Exponential smoothing — the lag is what makes it feel weighted.
      current.current.x += (target.current.x - current.current.x) * 0.18
      current.current.y += (target.current.y - current.current.y) * 0.18
      const dot = dotRef.current
      if (dot) {
        dot.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className={[
        'pointer-events-none fixed top-0 left-0 z-150 border-2 border-black mix-blend-difference',
        'transition-[width,height,background-color] duration-[var(--dur-fast)]',
        hot ? 'size-12 bg-[var(--section-accent)]' : 'size-4 bg-transparent',
      ].join(' ')}
    />
  )
}
