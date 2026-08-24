import { useEffect, type ReactNode } from 'react'
import { useHoverMediaContext, type MediaSpec } from './HoverMediaProvider'

interface HoverTriggerProps {
  spec: MediaSpec
  children: ReactNode
}

/**
 * An inline trigger inside the hero sentence.
 *
 * A real <button> rather than a <span> with mouse listeners: keyboard users can
 * reach it, focus opens the overlay the same way hover does, and assistive tech
 * announces it as interactive. Styled to sit inside running text.
 */
export function HoverTrigger({ spec, children }: HoverTriggerProps) {
  const { open, close, toggle, register, hasHover, activeId } = useHoverMediaContext()

  useEffect(() => register(spec), [register, spec])

  const isActive = activeId === spec.id

  return (
    <button
      type="button"
      data-hover-trigger
      aria-expanded={isActive}
      // Pointer devices reveal on hover; touch devices toggle on tap. Binding
      // both would fire twice on hybrid hardware.
      onMouseEnter={hasHover ? () => open(spec.id) : undefined}
      onMouseLeave={hasHover ? () => close(spec.id) : undefined}
      onFocus={() => open(spec.id)}
      onBlur={() => close(spec.id)}
      onClick={hasHover ? undefined : () => toggle(spec.id)}
      className={[
        // A bold accent-underlined word inside the sentence: the playful
        // register wants the live words to pop, not whisper. On hover/focus the
        // word fills with the accent block. Thick underline matches the chunky
        // display face.
        'cursor-pointer font-bold underline decoration-2 underline-offset-[0.14em] transition-colors duration-[var(--dur-fast)]',
        isActive
          ? 'bg-accent text-accent-ink decoration-transparent'
          : 'text-accent decoration-accent hover:bg-accent hover:text-accent-ink hover:decoration-transparent',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
