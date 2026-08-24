import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Intro } from '@/sections/Intro'
import { Now } from '@/sections/Now'
import { Work } from '@/sections/Work'
import { Playground } from '@/sections/Playground'
import { Practice } from '@/sections/Practice'
import { Stack } from '@/sections/Stack'
import { Patent } from '@/sections/Patent'
import { Contact } from '@/sections/Contact'
import { scrollToId } from '@/lib/scroll'

/**
 * Home.
 *
 * A cover plus six numbered chapters, one idea each. Work occupies four
 * consecutive frames — the index plus one per project — which is what makes it
 * unmistakably the centre of the page rather than the third of nine equal
 * sections it used to be.
 */
export function Home({ ready }: { ready: boolean }) {
  const { hash } = useLocation()

  /**
   * Arriving from the chapter register on a case-study page navigates to `/#id`.
   * Nothing scrolls on its own, because SmoothScroll resets to top on every
   * pathname change — so the jump has to happen after that reset, on the frame
   * after paint.
   */
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    const frame = requestAnimationFrame(() => scrollToId(id))
    return () => cancelAnimationFrame(frame)
  }, [hash])

  return (
    <>
      <Intro ready={ready} />
      <Now />
      <Work />
      <Playground />
      <Practice />
      <Stack />
      <Patent />
      <Contact />
    </>
  )
}
