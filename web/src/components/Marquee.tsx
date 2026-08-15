import { useReducedMotion } from 'motion/react'

interface MarqueeProps {
  items: readonly string[]
  /** Seconds for one full pass. Longer = calmer. */
  duration?: number
  reverse?: boolean
}

/**
 * Infinite marquee.
 *
 * CSS animation rather than JS: a transform-only keyframe runs on the
 * compositor and costs nothing per frame, whereas animating it from rAF burns
 * main-thread time for an effect nobody looks directly at.
 *
 * The content is duplicated once and the track translates exactly -50%, which
 * is what makes the loop seamless. aria-hidden on the duplicate keeps screen
 * readers from hearing everything twice.
 */
export function Marquee({ items, duration = 28, reverse = false }: MarqueeProps) {
  const reduceMotion = useReducedMotion()

  const row = (duplicate: boolean) => (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10"
      aria-hidden={duplicate ? 'true' : undefined}
    >
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-display text-2xl uppercase md:text-4xl">{item}</span>
          <span className="text-accent" aria-hidden="true">
            ✦
          </span>
        </li>
      ))}
    </ul>
  )

  // Reduced motion: render a static, wrapping list instead of a moving band.
  if (reduceMotion) {
    return (
      <div className="border-y border-line bg-secondary py-4 text-secondary-foreground">
        <ul className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-2 px-6">
          {items.map((item) => (
            <li key={item} className="font-display text-lg uppercase">
              {item}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="border-y border-line bg-secondary py-4 text-secondary-foreground">
      <div
        className="flex w-max animate-[marquee_var(--marquee-duration)_linear_infinite]"
        style={
          {
            '--marquee-duration': `${duration}s`,
            animationDirection: reverse ? 'reverse' : 'normal',
          } as React.CSSProperties
        }
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
