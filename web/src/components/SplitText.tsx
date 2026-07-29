import { motion, useReducedMotion } from 'motion/react'
import { EASE_EXPO_OUT } from '@/lib/motion'

interface SplitTextProps {
  children: string
  /** 'word' for headings, 'char' for short display type like a name. */
  by?: 'word' | 'char'
  /** Play on mount instead of waiting for scroll. Use for above-the-fold type. */
  immediate?: boolean
  delay?: number
  className?: string
  as?: 'span' | 'div'
}

/**
 * Masked per-word / per-character reveal.
 *
 * This is the signature move on award-tier sites: each unit sits in an
 * overflow-hidden box and slides up from below its own baseline, so the line
 * assembles rather than fading in. Fading is what a default React app does; this
 * is what makes type feel authored.
 *
 * Two things that matter for it not being slop:
 *
 *  - The text stays as real text. Words are wrapped in spans but the string is
 *    intact, so it's selectable, searchable and read correctly by a screen
 *    reader. Splitting into per-character spans would make assistive tech
 *    announce it letter by letter, so char mode marks the wrapper aria-label
 *    and hides the fragments.
 *  - Whitespace is preserved explicitly. Naive splitting on ' ' collapses
 *    spacing and the line re-flows wrong at narrow widths.
 */
export function SplitText({
  children,
  by = 'word',
  immediate = false,
  delay = 0,
  className,
  as = 'span',
}: SplitTextProps) {
  const reduceMotion = useReducedMotion()
  const Wrapper = as === 'div' ? motion.div : motion.span

  if (reduceMotion) {
    return <span className={className}>{children}</span>
  }

  const units = by === 'char' ? Array.from(children) : children.split(' ')
  const step = by === 'char' ? 0.028 : 0.055

  const animateProps = immediate
    ? { animate: 'visible' as const }
    : { whileInView: 'visible' as const, viewport: { once: true, amount: 0.4 } }

  return (
    <Wrapper
      className={className}
      initial="hidden"
      {...animateProps}
      aria-label={by === 'char' ? children : undefined}
      style={{ display: 'inline-block' }}
    >
      {units.map((unit, i) => (
        <span
          key={`${unit}-${i}`}
          // The mask. Each unit's overflow box is what creates the "rises into
          // place" read; without it you just get a translate.
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'top',
            // Leading can clip descenders inside an overflow box, so give the
            // mask a little vertical breathing room and pull it back with margin.
            paddingBottom: '0.12em',
            marginBottom: '-0.12em',
          }}
          aria-hidden={by === 'char' ? 'true' : undefined}
        >
          <motion.span
            style={{ display: 'inline-block', willChange: 'transform' }}
            variants={{
              hidden: { y: '110%' },
              visible: { y: '0%' },
            }}
            transition={{ duration: 0.75, ease: EASE_EXPO_OUT, delay: delay + i * step }}
          >
            {unit === ' ' ? ' ' : unit}
            {/* Re-insert the space that split() removed, inside the same mask so
                it travels with its word. */}
            {by === 'word' && i < units.length - 1 ? ' ' : null}
          </motion.span>
        </span>
      ))}
    </Wrapper>
  )
}
