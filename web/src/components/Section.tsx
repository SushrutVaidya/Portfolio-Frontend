import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface SectionProps {
  id: string
  /** Two-digit index, set in the pixel face — the numbered-section device. */
  index: string
  /** Caps line. Kept short; this is display type. */
  title: string
  /** Lowercase undercut beneath the caps line. */
  subtitle?: string
  /** Hex accent applied to --section-accent while this section is in view. */
  accent: string
  /** Paper stock, so adjacent sections read as different sheets. */
  stock?: 'paper-100' | 'paper-200' | 'paper-300' | 'paper-400'
  children: ReactNode
}

/**
 * Static class map. Tailwind scans source text for complete class names, so
 * `bg-${stock}` would compile to nothing — the utility is never generated.
 */
const STOCK_CLASS = {
  'paper-100': 'bg-paper-100',
  'paper-200': 'bg-paper-200',
  'paper-300': 'bg-paper-300',
  'paper-400': 'bg-paper-400',
} as const

/**
 * A page band.
 *
 * Owns two things beyond layout:
 *
 *  1. The accent handoff. Entering the viewport writes this section's accent to
 *     --section-accent on :root, so buttons, rules and triggers recolour as you
 *     scroll. This replaces the body-background swap at js/main.js:256, which
 *     flooded the whole viewport with saturated colour; here the paper ground
 *     stays constant and only the accent moves — one accent at a time.
 *
 *  2. The caps/lowercase heading pair. The caps line is the claim, the
 *     lowercase line undercuts it. Both are real text in one <h2>, so the
 *     document outline stays correct and it remains selectable and indexable.
 */
export function Section({
  id,
  index,
  title,
  subtitle,
  accent,
  stock = 'paper-100',
  children,
}: SectionProps) {
  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`${STOCK_CLASS[stock]} border-t-4 border-black px-6 py-20 md:px-12 md:py-28`}
      onViewportEnter={() => {
        document.documentElement.style.setProperty('--section-accent', accent)
      }}
      viewport={{ amount: 0.35 }}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-12 flex items-baseline gap-4">
            <span
              aria-hidden="true"
              className="font-pixel shrink-0 text-sm text-[var(--section-accent)]"
            >
              {index}
            </span>
            <h2 id={`${id}-heading`} className="text-3xl leading-[0.95] md:text-5xl">
              {title}
              {subtitle && (
                <span className="font-sans mt-3 block text-base font-normal normal-case tracking-normal text-muted-foreground md:text-xl">
                  {subtitle}
                </span>
              )}
            </h2>
          </div>
        </Reveal>
        {children}
      </div>
    </motion.section>
  )
}
