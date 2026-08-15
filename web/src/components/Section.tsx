import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { SplitText } from './SplitText'

interface SectionProps {
  id: string
  /** Two-digit index, set in the pixel face — the numbered-section device. */
  index: string
  /** Caps line. Kept short; this is display type. */
  title: string
  /** Lowercase undercut beneath the caps line. */
  subtitle?: string
  children: ReactNode
}

/**
 * Static class map. Tailwind scans source text for complete class names, so
 * `bg-${stock}` would compile to nothing — the utility is never generated.
 */
/**
 * A page band.
 *
 * Owns two things beyond layout:
 *
 *  1. The accent handoff. Entering the viewport writes this section's accent to
 *     --accent on :root, so buttons, rules and triggers recolour as you
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
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="border-t border-line px-6 py-24 md:px-12 md:py-36"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-16 flex items-baseline gap-5">
            <span
              aria-hidden="true"
              className="t-label shrink-0 text-accent"
            >
              {index}
            </span>
            <h2 id={`${id}-heading`} className="t-heading">
              <SplitText>{title}</SplitText>
              {subtitle && (
                <span className="t-sub mt-4 block font-sans font-normal normal-case tracking-normal">
                  {subtitle}
                </span>
              )}
            </h2>
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  )
}
