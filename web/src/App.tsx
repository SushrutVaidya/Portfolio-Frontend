import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { HoverMediaProvider } from '@/components/HoverMediaProvider'
import { SmoothScroll } from '@/components/SmoothScroll'
import { Preloader } from '@/components/Preloader'
import { RouteCurtain } from '@/components/RouteCurtain'
import { Nav } from '@/components/Nav'
import { Home } from '@/pages/Home'
import { CaseStudy, NotFound } from '@/pages/CaseStudy'
import { Loglens } from '@/pages/Loglens'
import { AboutMe } from '@/pages/AboutMe'
import { trackPageView } from '@/lib/analytics'
import { DUR, EASE } from '@/lib/motion'

/**
 * App shell.
 *
 * Ordering matters. SmoothScroll sits inside the router — it resets Lenis on
 * navigation — but outside the routes, so one instance survives route changes
 * instead of being torn down and rebuilt on every transition.
 *
 * The preloader gates `ready`, which the cover's entrance waits on. Without the
 * gate the entrance plays behind the curtain and the page looks already-settled
 * the moment it lifts, wasting the only entrance the site gets.
 *
 * There is no shared footer element: Contact closes the home page and the
 * next-project link closes each case study, so the two routes end differently on
 * purpose.
 */
export default function App() {
  const [ready, setReady] = useState(false)
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const onDone = useCallback(() => setReady(true), [])

  // gtag only auto-sends the first page_view; client-side routes need telling.
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  return (
    <SmoothScroll>
      <Preloader onDone={onDone} />
      <RouteCurtain />
      <Nav />

      <a
        href="#work"
        className="t-label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus:border focus:border-line-strong focus:bg-paper-raised focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to work
      </a>

      <HoverMediaProvider>
        {/* mode="wait" so the outgoing page finishes before the incoming one
            starts — overlapping them on a full-page crossfade reads as a
            glitch rather than a transition. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            // No fade out: RouteCurtain covers the swap, and crossfading beneath
            // an opaque panel only delays the incoming paint.
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={{ duration: DUR.fast, ease: EASE }}
            // visibility rather than display:none — the cover needs its layout
            // resolved before the curtain lifts, or the name's mask-rise
            // measures against a zero-height box.
            style={{ visibility: ready ? 'visible' : 'hidden' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home ready={ready} />} />
              <Route path="/about" element={<AboutMe />} />
              <Route path="/loglens" element={<Loglens />} />
              <Route path="/work/:slug" element={<CaseStudy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </HoverMediaProvider>
    </SmoothScroll>
  )
}
