import { useEffect, type ReactNode } from 'react'
import { useHoverMediaContext, type MediaSpec } from './HoverMediaProvider'

interface HoverTriggerProps {
  spec: MediaSpec
  children: ReactNode
  /**
   * Trailing punctuation (a comma or period) rendered INSIDE the button, glued
   * to the last word. As bare text after the trigger it would break onto the
   * next line on its own — the orphaned comma/period jank. Kept in normal ink,
   * not the accent link colour, so it still reads as sentence punctuation.
   */
  punct?: string
}

/**
 * An inline trigger inside the hero sentence.
 *
 * A real <button> rather than a <span> with mouse listeners: keyboard users can
 * reach it, focus opens the overlay the same way hover does, and assistive tech
 * announces it as interactive. Styled to sit inside running text.
 *
 * The underline lives on an inner label span (not the button) so the trailing
 * punctuation can sit inside the same box without inheriting the underline —
 * that's what keeps the comma/period from orphaning while still looking like
 * plain punctuation.
 */
export function HoverTrigger({ spec, children, punct }: HoverTriggerProps) {
  const { open, close, toggle, register, hasHover, activeId } = useHoverMediaContext()

  useEffect(() => register(spec), [register, spec])

  const isActive = activeId === spec.id

  return (
    <button
      type="button"
      data-hover-trigger
      // No aria-expanded: this isn't a disclosure (the media it reveals is
      // decorative/aria-hidden). The live region in HoverMediaProvider announces
      // what opened instead.
      // Pointer devices reveal on hover; touch devices toggle on tap. Binding
      // both would fire twice on hybrid hardware.
      onMouseEnter={hasHover ? () => open(spec.id) : undefined}
      onMouseLeave={hasHover ? () => close(spec.id) : undefined}
      onFocus={() => open(spec.id)}
      onBlur={() => close(spec.id)}
      onClick={hasHover ? undefined : () => toggle(spec.id)}
      className={[
        // A bold accent word inside the sentence. On hover/focus it fills with
        // the accent block. `inline` (a <button> is inline-block + centred by
        // default, which jams a wrapped value in as a centred box) and
        // `box-decoration-clone` (so the fill hugs the words per line instead of
        // stretching full-width when it wraps).
        'group inline box-decoration-clone text-left cursor-pointer font-bold transition-colors duration-[var(--dur-fast)]',
        isActive
          ? 'bg-accent text-accent-ink'
          : 'text-accent hover:bg-accent hover:text-accent-ink',
      ].join(' ')}
    >
      <span
        className={[
          'underline decoration-2 underline-offset-[0.14em]',
          isActive ? 'decoration-transparent' : 'decoration-accent group-hover:decoration-transparent',
        ].join(' ')}
      >
        {children}
      </span>
      {punct && (
        <span className={isActive ? 'text-accent-ink' : 'text-ink group-hover:text-accent-ink'}>
          {punct}
        </span>
      )}
    </button>
  )
}
