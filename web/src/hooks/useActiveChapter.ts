import { useEffect, useRef, useState } from 'react'
import { chapters } from '@/content/chapters'

interface Band {
  id: string
  top: number
  bottom: number
}

/**
 * Which chapter is currently in view.
 *
 * Drives the folio readout in the nav bar — the detail that makes the navigation
 * feel like an instrument reading the page rather than a menu bolted on top of
 * it.
 *
 * Two decisions, both learned the hard way:
 *
 *  1. A scan line a third of the way down the viewport, NOT an intersection
 *     ratio. With full-height frames two adjacent sections are routinely both
 *     40% visible, and a ratio-based observer flickers between them on every
 *     scroll frame.
 *
 *  2. Element offsets are measured ONCE and cached, then compared against
 *     window.scrollY. The obvious implementation calls getBoundingClientRect()
 *     on six elements inside the scroll handler, which forces layout six times
 *     per frame on a page that is already running Lenis and a parallax — a
 *     guaranteed way to lose frames on exactly the interaction the reader spends
 *     the whole visit doing.
 *
 * Cached offsets go stale on resize, on font load, and when the route changes,
 * so they are re-measured on resize and whenever the chapter set changes.
 */
export function useActiveChapter(): string | null {
  const [active, setActive] = useState<string | null>(null)
  const bands = useRef<Band[]>([])

  useEffect(() => {
    const measure = () => {
      const y = window.scrollY
      bands.current = chapters.flatMap((chapter) => {
        const el = document.getElementById(chapter.id)
        if (!el) return []
        const rect = el.getBoundingClientRect()
        // Document coordinates, so the comparison below needs no further reads.
        return [{ id: chapter.id, top: rect.top + y, bottom: rect.bottom + y }]
      })
    }

    const read = () => {
      const line = window.scrollY + window.innerHeight * 0.34
      const hit = bands.current.find((b) => line >= b.top && line < b.bottom)
      const next = hit?.id ?? null
      setActive((prev) => (prev === next ? prev : next))
    }

    const remeasure = () => {
      measure()
      read()
    }

    remeasure()

    // Fonts change every frame's height, and the display face is a webfont —
    // measuring before it lands puts every band in the wrong place.
    document.fonts?.ready.then(remeasure).catch(() => {})

    // And the page genuinely reflows after mount: the Now frame's sentence is
    // filled from /api/stats, and a different song title is a different number
    // of lines, which moves every chapter below it.
    const observer = new ResizeObserver(remeasure)
    observer.observe(document.body)

    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', remeasure)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', remeasure)
    }
  }, [])

  return active
}
