import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

interface CountUpProps {
  /** Source string, e.g. "90%", "10+", "34". Non-numeric parts are preserved. */
  value: string
  durationMs?: number
}

/**
 * Counts a metric up when it scrolls into view.
 *
 * Parses the numeric portion and replays the prefix/suffix verbatim, so "90%"
 * animates 0→90 and keeps its sign, and "2022–24" is left alone because it
 * isn't a single quantity.
 *
 * Uses an eased rAF loop rather than a linear interval: a linear count reads
 * like a loading counter, an eased one reads like a reveal. The DOM text is
 * written from the loop while React state holds only the final displayed
 * string, so this doesn't re-render on every frame.
 */
export function CountUp({ value, durationMs = 1400 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduceMotion = useReducedMotion()
  const [done, setDone] = useState(false)

  // Split into leading non-digits, the number, then trailing characters.
  const match = value.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/)

  useEffect(() => {
    if (!inView || done || reduceMotion || !match) return
    const [, prefix, numeric, suffix] = match
    const target = parseFloat(numeric)
    const decimals = numeric.includes('.') ? numeric.split('.')[1].length : 0
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      // easeOutExpo: a counter has to decelerate into its final value or the
      // last digits land too fast to read.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      const el = ref.current
      if (el) el.textContent = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`
      if (t < 1) frame = requestAnimationFrame(tick)
      else setDone(true)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, done, reduceMotion, match, durationMs])

  // Ranges and non-numeric values render as-is.
  if (!match || reduceMotion) return <span>{value}</span>

  // Render the final value in markup so it's correct before JS runs and for
  // anything reading the DOM without executing animations.
  return <span ref={ref}>{inView || done ? value : `${match[1]}0${match[3]}`}</span>
}
