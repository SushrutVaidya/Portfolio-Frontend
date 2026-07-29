import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FLAG = 'rickrolled'

/**
 * The rickroll counter.
 *
 * Flow, preserved from js/main.js:436 — clicking the link sets a sessionStorage
 * flag and increments server-side; when the tab regains visibility we read the
 * count back and announce it. Splitting increment (on click) from read (on
 * return) is what makes the reveal land after the user has been rickrolled,
 * rather than spoiling it beforehand.
 */
export function useRickroll() {
  const [victimNumber, setVictimNumber] = useState<number | null>(null)

  const trigger = useCallback(() => {
    sessionStorage.setItem(FLAG, 'true')
    // Fire and forget: never block navigation on the counter.
    void api.rickroll().catch(() => {})
  }, [])

  useEffect(() => {
    const check = () => {
      if (sessionStorage.getItem(FLAG) !== 'true') return
      sessionStorage.removeItem(FLAG)
      api
        .rickrollCount()
        .then((r) => setVictimNumber(r.count))
        .catch(() => {})
    }

    check()
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const dismiss = useCallback(() => setVictimNumber(null), [])

  return { trigger, victimNumber, dismiss }
}
