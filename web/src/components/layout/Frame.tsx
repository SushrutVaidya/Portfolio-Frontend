import type { CSSProperties, ReactNode } from 'react'

/**
 * The compositional layer.
 *
 * Every earlier version of this site was `mx-auto max-w-5xl` with sections
 * stacked vertically, which produces a document rather than a composition. The
 * geometry the award-tier references actually share:
 *
 *   - the viewport is the frame, not the content column
 *   - content is anchored to specific grid cells, deliberately off-centre
 *   - micro-copy lives in the margins, not above the content
 *   - display type is allowed to bleed past the edge
 *   - negative space is structural rather than leftover
 *
 * These primitives make that geometry cheap, so layout decisions live in one
 * file instead of being re-improvised per section — which is what let the
 * previous builds drift into eleven colours and ten type sizes.
 */

/* ══════════════════════════════════════════════════════════════════ */

interface FrameProps {
  children: ReactNode
  /** Full viewport height. Off for sections that should size to content. */
  full?: boolean
  /** Hairline rule along the top edge — the chapter divider. */
  rule?: boolean
  /**
   * `deep` recedes one step from the ground. Used sparingly, to give the page a
   * change of pressure rather than a change of palette.
   */
  tone?: 'ground' | 'deep'
  className?: string
  id?: string
  style?: CSSProperties
  'aria-labelledby'?: string
  'aria-label'?: string
}

/**
 * A full-bleed section.
 *
 * This is the ONLY place horizontal inset is defined. Nothing inside a Frame
 * adds its own padding, which is what keeps every section on the page optically
 * aligned to one edge — the cheapest available signal that a layout was
 * composed rather than assembled.
 *
 * Top padding clears the fixed nav bar; bottom padding is deliberately smaller
 * than top, because a frame that is optically centred looks bottom-heavy.
 */
export function Frame({
  children,
  full,
  rule,
  tone = 'ground',
  className = '',
  id,
  style,
  ...aria
}: FrameProps) {
  return (
    <section
      id={id}
      style={style}
      {...aria}
      className={[
        'relative w-full px-6 sm:px-10 lg:px-16',
        full
          ? 'flex min-h-dvh flex-col justify-center pt-32 pb-24'
          : 'pt-28 pb-24 lg:pt-40 lg:pb-32',
        rule ? 'border-t border-line' : '',
        tone === 'deep' ? 'bg-paper-deep' : '',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════ */

/**
 * Twelve-column grid. Sections place children into named spans rather than
 * nesting flex containers, so the vertical rhythm of one section lines up with
 * the next even when their content is completely different.
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
 * Static strings, not template literals: Tailwind scans source text for
 * complete class names, so a computed `col-span-${n}` compiles to nothing.
 * Learned that on an earlier version of this site, where an entire section
 * silently collapsed to a single column in production but not in dev.
 */
export const col = {
  /** Narrow left rail — folios, labels, ordinals. */
  rail: 'col-span-4 lg:col-span-2',
  /** The mirror of `rail`, hard against the right edge. */
  railRight: 'col-span-4 lg:col-span-2 lg:col-start-11',
  /** The main reading measure, offset off the left edge. */
  main: 'col-span-4 lg:col-span-7 lg:col-start-4',
  /** The mirror of `main` — measure on the left, rail on the right. */
  mainLeft: 'col-span-4 lg:col-span-7 lg:col-start-2',
  /** Wide — display type that needs room. */
  wide: 'col-span-4 lg:col-span-9 lg:col-start-4',
  /** Full bleed within the frame. */
  full: 'col-span-4 lg:col-span-12',
  /** Right-anchored, for asymmetric pairs. */
  right: 'col-span-4 lg:col-span-5 lg:col-start-8',
  /** Left-anchored half. */
  left: 'col-span-4 lg:col-span-5',
  /** Wide, but hard against the left edge — for mega type. */
  bleed: 'col-span-4 lg:col-span-11',
} as const

/* ══════════════════════════════════════════════════════════════════ */

const CORNER_POSITION = {
  // top-24 rather than top-8: the fixed nav bar occupies the first 64px, and a
  // label underneath it read as a collision on every frame.
  'top-left': 'top-24 left-6 sm:left-10 lg:left-16',
  'top-right': 'top-24 right-6 sm:right-10 lg:right-16',
  'bottom-left': 'bottom-8 left-6 sm:left-10 lg:left-16',
  'bottom-right': 'bottom-8 right-6 sm:right-10 lg:right-16',
} as const

/**
 * Margin micro-copy: a folio, a label, a count, a status.
 *
 * Absolutely positioned against the Frame so it reads as annotation on a page
 * rather than content in a flow. This one device does more for perceived
 * art-direction than any amount of motion.
 *
 * aria-hidden by default, because these are usually decorative restatements of
 * something a heading already says, and announcing "zero four" before every
 * section is noise. Pass `decorative={false}` when the content is genuinely
 * only available here — the API status line, for instance.
 */
export function Corner({
  children,
  at = 'top-left',
  decorative = true,
  className = '',
}: {
  children: ReactNode
  at?: keyof typeof CORNER_POSITION
  decorative?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden={decorative ? 'true' : undefined}
      className={`t-label absolute ${CORNER_POSITION[at]} z-10 select-none ${className}`}
    >
      {children}
    </span>
  )
}

/**
 * The chapter folio: number in the accent, title in muted mono, on one line in
 * the top-left margin. Every numbered frame opens with this, which is what makes
 * the page read as a sequence rather than a scroll.
 */
export function Folio({ index, title }: { index: string; title: string }) {
  return (
    <Corner at="top-left">
      <span className="text-accent">{index}</span>
      <span className="mx-2 text-ink-faint">/</span>
      {title}
    </Corner>
  )
}

/**
 * Vertical label pinned to the right edge. Uses writing-mode rather than a
 * rotate transform so the text still selects, and hidden below `lg` where the
 * margin isn't wide enough to hold it without crowding the measure.
 */
export function EdgeLabel({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="t-label-vertical pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 select-none lg:block"
    >
      {children}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════ */

/**
 * Display type that bleeds past the left edge.
 *
 * The optical trick behind most award-site headlines: pulling type a little
 * past the frame signals the viewport is a window onto something larger. Kept
 * to a fraction of the character width so it never clips a glyph you need to
 * read, and disabled below `lg` where there's no room to give away.
 */
export function Bleed({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`lg:-ml-[0.055em] ${className}`}>{children}</div>
}

/**
 * A hairline with a label sitting on it. Cheap, and it does more for perceived
 * structure than any amount of animation.
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
