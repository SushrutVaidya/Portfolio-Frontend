import { useEffect, useState } from 'react'

function format(date: Date): string {
  const minutes = date.getMinutes()
  const ampm = date.getHours() >= 12 ? 'pm' : 'am'
  const hours = date.getHours() % 12 || 12
  return `${hours}:${String(minutes).padStart(2, '0')}${ampm}`
}

/**
 * Ticking wall clock in the viewer's own timezone.
 *
 * Deliberately ignores StatsResponse.currentTime from the API. The original did
 * the same (js/main.js:107) and it's the right call: a server-rendered
 * timestamp goes stale immediately, and "it's 3:04pm" reads as live only if it
 * actually advances. The copy says where *he* is, the clock says when *you*
 * are — that contrast is the point.
 */
export function useLiveClock(): string {
  const [time, setTime] = useState(() => format(new Date()))

  useEffect(() => {
    // Align to the next second boundary so the display doesn't lag by up to 1s.
    let interval: number | undefined
    const align = window.setTimeout(() => {
      setTime(format(new Date()))
      interval = window.setInterval(() => setTime(format(new Date())), 1000)
    }, 1000 - (Date.now() % 1000))

    return () => {
      window.clearTimeout(align)
      if (interval) window.clearInterval(interval)
    }
  }, [])

  return time
}
