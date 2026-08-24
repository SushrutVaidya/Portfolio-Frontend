import { useReducedMotion } from 'motion/react'

/**
 * A label that swaps on hover: the text slides up out of a clipping box while an
 * identical copy slides in from below, in the accent.
 *
 * This is the one link device worth stealing wholesale from award-tier sites.
 * A colour change on hover is a default; type physically moving through a window
 * is a response, and it costs one extra span and no JavaScript.
 *
 * Requires the parent anchor or button to carry `group/swap` — the animation is
 * driven from the interactive element, not from this span, so the whole row is
 * the hit area rather than just the glyphs.
 *
 * Two details that are easy to get wrong:
 *
 *   - `pb-[0.14em]` on both copies. Without it the clipping box cuts the
 *     descenders, and "DevQuest" loses the tail of its Q while "Résumé" keeps
 *     its accent — a bug that only shows up on some labels.
 *   - `top-full` on the second copy resolves against the wrapper's padding box,
 *     which includes that padding, so the two copies stay exactly one line
 *     apart without a magic number.
 *
 * Under reduced motion it renders as one static span. A duplicated label with no
 * movement would just be a screen-reader hazard for no benefit.
 */
export function Swap({
  children,
  className = '',
}: {
  children: string
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <span className={`${className} transition-colors group-hover/swap:text-accent`}>
        {children}
      </span>
    )
  }

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <span className="block pb-[0.14em] transition-transform duration-[var(--dur-base)] group-hover/swap:-translate-y-full">
        {children}
      </span>
      {/* aria-hidden: the same word twice would be announced twice. */}
      <span
        aria-hidden="true"
        className="absolute top-full left-0 block pb-[0.14em] text-accent transition-transform duration-[var(--dur-base)] group-hover/swap:-translate-y-full"
      >
        {children}
      </span>
    </span>
  )
}
