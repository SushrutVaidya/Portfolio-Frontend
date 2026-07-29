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
        'font-head cursor-pointer border-b-4 px-0.5 transition-colors duration-[var(--dur-fast)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black',
        isActive
          ? 'border-black bg-[var(--section-accent)] text-[var(--section-accent-ink)]'
          : 'border-[var(--section-accent)] hover:bg-[var(--section-accent)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
