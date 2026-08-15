/**
 * Motion constants.
 *
 * ONE curve, four durations - the discipline taken from dennissnellenberg.com,
 * which ships exactly that and is most of why its motion reads as designed.
 * The previous version exported two curves and a stagger, and components also
 * reached for Motion's own spring defaults, so nothing felt related to anything
 * else. Adding more animation on top of that made it louder, not better.
 *
 * Mirrors --ease and --dur-* in index.css. Seconds here (Motion's unit),
 * milliseconds there.
 */

/** The single easing curve. Symmetric, steep through the middle. */
export const EASE = [0.7, 0, 0.3, 1] as const

export const DUR = {
  /** Hover and press feedback. */
  fast: 0.3,
  /** Default for anything entering the viewport. */
  base: 0.5,
  /** Larger surfaces: display type, panels. */
  smooth: 0.7,
  /** Full-screen moves only - preloader, route curtain. */
  slow: 0.9,
} as const

/**
 * Stagger step for sequenced entrances.
 *
 * Deliberately larger than the old 0.09: fewer things moving, further apart,
 * reads as composed rather than busy.
 */
export const STAGGER_STEP = 0.12
