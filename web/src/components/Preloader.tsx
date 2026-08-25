import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { DUR, EASE } from '@/lib/motion'
import { lockScroll, unlockScroll } from '@/lib/scroll'

/**
 * Intro sequence.
 *
 * A brief branded beat that hides first paint (font swap, layout settle) behind
 * a deliberate moment, so the site appears composed rather than assembling in
 * front of you. The mark is the "SV" monogram set in the display face and
 * coloured like the cover (S accent, V blue), NOT a hand-drawn SVG path: the
 * old path was garbled and read as "TM", which is exactly the kind of detail a
 * loading screen must not get wrong.
 *
 * Locks scroll while running and hands off with onDone so the cover animates
 * only once the curtain is clear.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Reduced motion: no theatre, straight to content.
    if (reduceMotion) {
      setVisible(false)
      onDone()
      return
    }

    lockScroll()
    const timer = window.setTimeout(() => {
      setVisible(false)
      onDone()
    }, 1100)

    return () => {
      window.clearTimeout(timer)
      unlockScroll()
    }
  }, [onDone, reduceMotion])

  useEffect(() => {
    if (!visible) unlockScroll()
  }, [visible])

  if (reduceMotion) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-200 flex items-center justify-center bg-paper"
          // Curtain lifts rather than fades: a wipe reads as intentional, a
          // fade reads as a loading spinner.
          exit={{ y: '-100%' }}
          transition={{ duration: DUR.slow, ease: EASE }}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center">
            <motion.div
              className="font-display text-7xl font-extrabold leading-none md:text-8xl"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: DUR.base, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <span className="text-accent">S</span>
              <span className="text-blue">V</span>
            </motion.div>
            <motion.p
              className="t-label mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DUR.fast, delay: 0.35 }}
            >
              Sushrut Vaidya
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

