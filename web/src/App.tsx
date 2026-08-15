import { useCallback, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { HoverMediaProvider } from '@/components/HoverMediaProvider'
import { SmoothScroll } from '@/components/SmoothScroll'
import { Preloader } from '@/components/Preloader'
import { Cursor } from '@/components/Cursor'
import { RouteCurtain } from '@/components/RouteCurtain'
import { SectionIndex } from '@/components/SectionIndex'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { Footer } from '@/sections/Footer'
import { Home } from '@/pages/Home'
import { CaseStudy } from '@/pages/CaseStudy'
import { DUR, EASE } from '@/lib/motion'

/**
 * App shell.
 *
 * Ordering matters here: SmoothScroll must sit inside the router (it resets
 * Lenis on navigation) but outside the routes, so a single instance survives
 * route changes rather than being torn down and rebuilt on every transition.
 *
 * The preloader gates `ready`, which the hero waits on — otherwise the entrance
 * animation plays behind the curtain and the page appears already-settled when
 * it lifts.
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
      {location.pathname === '/' && <SectionIndex />}

      <a
        href="#work"
        className="font-display sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus:border focus:border-line focus:bg-primary focus:px-4 focus:py-2"
      >
        Skip to work
      </a>

      <HoverMediaProvider>
        {/* Route transition. mode="wait" so the outgoing page finishes before
            the incoming one starts — overlapping them on a full-page crossfade
            reads as a glitch. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            // No crossfade: RouteCurtain covers the swap, and fading
            // underneath an opaque panel just delays the incoming paint.
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={{ duration: DUR.fast, ease: EASE }}
            style={{ visibility: ready ? 'visible' : 'hidden' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/work/:slug" element={<CaseStudy />} />
              <Route path="*" element={<CaseStudy />} />
            </Routes>
            <Footer />
          </motion.div>
        </AnimatePresence>
      </HoverMediaProvider>
    </SmoothScroll>
  )
}
