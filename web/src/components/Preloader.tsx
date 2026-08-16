import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { DUR, EASE } from '@/lib/motion'
import { lockScroll, unlockScroll } from '@/lib/scroll'

const MONOGRAM_PATH =
  'M12 4 L52 4 L52 14 L34 14 L34 60 L22 60 L22 14 L12 14 Z M60 4 L72 4 L82 34 L92 4 L104 4 L104 60 L93 60 L93 26 L84 52 L79 52 L70 26 L70 60 L60 60 Z'

/**
 * Intro sequence.
 *
 * Modelled on david-hckh.com, which gates its reveal behind a body.is-loading
 * state and wipes a logo via an SVG mask driven by scaleY. The point isn't
 * decoration — it hides first-paint (font swap, layout settle) behind a
 * deliberate beat, so the site appears composed rather than assembling itself
 * in front of you.
 *
 * Locks scroll while running and hands off with onDone so the hero animates
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
      // 1200ms, down from 1900. The preloader's job is to hide first paint —
      // font swap and layout settle — behind one deliberate beat, and that is
      // done well before 1.9s. Anything past that is charging the reader
      // interest on a monogram they did not ask to see.
    }, 1200)

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
          className="bg-paper fixed inset-0 z-200 flex items-center justify-center"
          // Curtain lifts rather than fades — a wipe reads as intentional,
          // a fade reads as a loading spinner.
          exit={{ y: '-100%' }}
          transition={{ duration: DUR.slow, ease: EASE }}
          aria-hidden="true"
        >
          <div className="relative">
            <svg viewBox="0 0 116 64" className="h-20 w-auto md:h-28" role="presentation">
              <defs>
                <mask id="monogram-wipe">
                  <rect x="0" y="0" width="116" height="64" fill="black" />
                  {/* The wipe: a white rect grows upward inside the mask, so the
                      solid monogram fills in from the baseline. */}
                  <motion.rect
                    x="0"
                    width="116"
                    height="64"
                    fill="white"
                    style={{ transformOrigin: 'bottom' }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.85, ease: EASE }}
                  />
                </mask>
              </defs>
              {/* Ghost outline underneath so the shape reads before it fills. */}
              {/* var(--ink), NOT var(--foreground): the latter only exists as
                  a Tailwind theme alias (--color-foreground), so it resolved to
                  nothing here and the fill fell back to black — an invisible
                  monogram on a near-black curtain. */}
              <path d={MONOGRAM_PATH} fill="var(--ink)" opacity="0.14" />
              <path d={MONOGRAM_PATH} fill="var(--ink)" mask="url(#monogram-wipe)" />
            </svg>

            <motion.p
              className="t-label mt-6 block text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DUR.fast, delay: 0.45 }}
            >
              Sushrut Vaidya
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
