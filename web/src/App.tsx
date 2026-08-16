import { useCallback, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { HoverMediaProvider } from '@/components/HoverMediaProvider'
import { SmoothScroll } from '@/components/SmoothScroll'
import { Preloader } from '@/components/Preloader'
import { Cursor } from '@/components/Cursor'
import { RouteCurtain } from '@/components/RouteCurtain'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { Home } from '@/pages/Home'
import { CaseStudy } from '@/pages/CaseStudy'
import { DUR, EASE } from '@/lib/motion'

/**
 * App shell.
 *
 * Ordering matters: SmoothScroll sits inside the router (it resets Lenis on
 * navigation) but outside the routes, so one instance survives route changes
 * rather than being torn down and rebuilt on every transition.
 *
 * The preloader gates `ready`, which the intro waits on - otherwise the entrance
 * plays behind the curtain and the page looks already-settled when it lifts.
 *
 * The section-index rail is gone. With six numbered frames, each already carrying
 * its index in the corner, a floating duplicate of that same information was
 * noise competing with the composition.
 */
export default function App() {
  const [ready, setReady] = useState(false)
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const onDone = useCallback(() => setReady(true), [])

  return (
    <SmoothScroll>
      <Preloader onDone={onDone} />
      <Cursor />
      <RouteCurtain />
      <ThemeSwitcher />

      <a
        href="#work"
        className="t-label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus:border focus:border-line focus:bg-paper-raised focus:px-4 focus:py-2"
      >
        Skip to work
      </a>

      <HoverMediaProvider>
        {/* mode="wait" so the outgoing page finishes before the incoming one
            starts - overlapping them on a full-page crossfade reads as a glitch. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            // No crossfade out: RouteCurtain covers the swap, and fading beneath
            // an opaque panel only delays the incoming paint.
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={{ duration: DUR.fast, ease: EASE }}
            style={{ visibility: ready ? 'visible' : 'hidden' }}
          >
            <Routes location={location}>
              {/* Contact now closes the home page itself, so there is no shared
                  footer to render outside the routes. */}
              <Route path="/" element={<Home ready={ready} />} />
              <Route path="/work/:slug" element={<CaseStudy />} />
              <Route path="*" element={<CaseStudy />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </HoverMediaProvider>
    </SmoothScroll>
  )
}
