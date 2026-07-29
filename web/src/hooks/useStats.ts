import { useEffect, useState } from 'react'
import { api, STATS_FALLBACK, type Stats } from '@/lib/api'

interface UseStatsResult {
  stats: Stats
  /** null while in flight; false once we've fallen back. */
  live: boolean | null
}

/**
 * Hero sentence data.
 *
 * Always returns renderable stats — never null, never a loading hole. The hero
 * sentence is the first thing on the page, and the previous implementation was
 * right to render fallback copy rather than an empty state
 * (js/main.js:70-87). `live` is exposed so the UI can be honest about whether
 * it's showing real data, without ever blocking on it.
 */
export function useStats(): UseStatsResult {
  const [stats, setStats] = useState<Stats>(STATS_FALLBACK)
  const [live, setLive] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .stats()
      .then((s) => {
        if (cancelled) return
        setStats(s)
        setLive(true)
      })
      .catch(() => {
        if (cancelled) return
        setStats(STATS_FALLBACK)
        setLive(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { stats, live }
}
