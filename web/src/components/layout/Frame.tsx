import type { ReactNode } from 'react'

/**
 * The compositional layer.
 *
 * Every earlier version of this site was `mx-auto max-w-5xl` with sections
 * stacked vertically - which produces a document, not a composition. The
 * award-tier sites this is aiming at share a different geometry:
 *
 *   - the viewport is the frame, not the content column
 *   - content is anchored to specific grid cells, deliberately off-centre
 *   - micro-copy lives in the corners, not above the content
 *   - display type is allowed to bleed past the edge
 *   - negative space is structural rather than leftover
 *
 * These primitives make that geometry cheap to use, so the layout decisions live
 * in one place instead of being re-improvised per section.
 */

/* ------------------------------------------------------------------ */

interface FrameProps {
  children: ReactNode
  /** Full viewport height. Off for sections that should size to content. */
  full?: boolean
  /** Hairline rule along the top edge - the section divider. */
  rule?: boolean
  className?: string
  id?: string
  'aria-labelledby'?: string
}

/**
 * A full-bleed section. Padding is asymmetric and generous, and it is the ONLY
 * place horizontal inset is defined - nothing inside adds its own, which is what
 * keeps every section optically aligned to the same edge.
 */
export function Frame({ children, full, rule, className = '', id, ...aria }: FrameProps) {
  return (
    <section
      id={id}
      {...aria}
      className={[
        'relative w-full px-6 sm:px-10 lg:px-16',
        full ? 'flex min-h-dvh flex-col justify-center py-28' : 'py-28 lg:py-44',
        rule ? 'border-t border-line' : '',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------ */

/**
 * Twelve-column grid. Sections place children into named spans rather than
 * nesting flex containers, so the vertical rhythm of one section lines up with
 * the next even when their content differs.
 */
export function Grid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-4 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-x-8 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Column spans, as a closed set.
 *
 * Static strings, not template literals: Tailwind scans source text for complete
 * class names, so a computed `col-span-${n}` compiles to nothing. Learned that
 * the hard way on an earlier version of this site.
 */
export const col = {
  /** Narrow left rail - labels, indices, metadata. */
  rail: 'col-span-4 lg:col-span-2',
  /** The main reading measure, offset from the left edge. */
  main: 'col-span-4 lg:col-span-7 lg:col-start-4',
  /** Wide - display type that wants room. */
  wide: 'col-span-4 lg:col-span-9 lg:col-start-4',
  /** Full bleed within the frame. */
  full: 'col-span-4 lg:col-span-12',
  /** Right-anchored, for asymmetric pairs. */
  right: 'col-span-4 lg:col-span-5 lg:col-start-8',
  /** Left-anchored half. */
  left: 'col-span-4 lg:col-span-5',
} as const

/* ------------------------------------------------------------------ */

/**
 * Corner micro-copy: an index, a label, a count. Absolutely positioned against
 * the frame so it reads as annotation on the page rather than content in the
 * flow - the device that makes a layout feel art-directed rather than authored
 * in a CMS.
 *
 * aria-hidden by default: these are almost always decorative restatements of
 * information already present in a heading, and announcing "zero two" before
 * every section is noise.
 */
export function Corner({
  children,
  at = 'top-left',
  decorative = true,
}: {
  children: ReactNode
  at?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  decorative?: boolean
}) {
  const position = {
    'top-left': 'top-8 left-6 sm:left-10 lg:left-16',
    'top-right': 'top-8 right-6 sm:right-10 lg:right-16',
    'bottom-left': 'bottom-8 left-6 sm:left-10 lg:left-16',
    'bottom-right': 'bottom-8 right-6 sm:right-10 lg:right-16',
  }[at]

  return (
    <span
      aria-hidden={decorative ? 'true' : undefined}
      className={`t-label absolute ${position} z-10 select-none`}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */

/**
 * Display type that bleeds past the left edge.
 *
 * The optical trick behind most award-site headlines: pulling type a little past
 * the frame signals that the viewport is a window onto something larger. Kept to
 * a fraction of the character width so it never actually clips a glyph you need
 * to read, and disabled below `lg` where there is no room to spare.
 */
export function Bleed({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`lg:-ml-[0.06em] ${className}`}>{children}</div>
}

/* ------------------------------------------------------------------ */

/**
 * A hairline with a label sitting on it - the "01 / SELECTED WORK" device.
 * Cheap, and it does more for perceived structure than any amount of motion.
 */
export function Marker({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-baseline gap-5 border-b border-line pb-4">
      <span aria-hidden="true" className="t-label text-accent">
        {index}
      </span>
      <span className="t-label">{label}</span>
    </div>
  )
}
