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
        // Italic serif inside a roman serif sentence: an editorial device that
        // marks exactly which words are the live, changing ones. A filled accent
        // block (what this used to be) is far too heavy at display scale on a
        // dark ground — it read as five highlighter marks across the frame.
        'cursor-pointer font-display italic underline decoration-1 underline-offset-[0.16em]',
        'transition-colors duration-[var(--dur-fast)]',
        isActive
          ? 'text-accent decoration-accent decoration-2'
          : 'decoration-line-strong hover:text-accent hover:decoration-accent',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
