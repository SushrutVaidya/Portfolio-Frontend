/**
 * Motion constants, mirroring the CSS custom properties in index.css.
 *
 * Motion's JS animations and CSS transitions must use the same curves, or
 * hover states and scroll reveals visibly disagree. Keeping the numbers in one
 * module means a change to the feel of the site is a one-line edit rather than
 * a search for cubic-beziers across a dozen components.
 *
 * Durations are seconds here (Motion's unit) and milliseconds in CSS.
 */

/** --ease-expo-out. The workhorse: fast out of the gate, long gentle settle. */
export const EASE_EXPO_OUT = [0.19, 1, 0.22, 1] as const

/** --ease-quad-in-out. For symmetric moves where nothing should feel thrown. */
export const EASE_QUAD_IN_OUT = [0.455, 0.03, 0.515, 0.955] as const

/**
 * Named for the job, not the number — `DUR.reveal` says what it's for, whereas
 * a derived `DUR.slow * 0.75` makes the reader do arithmetic to learn nothing.
 * Keep in step with the --dur-* properties in index.css.
 */
export const DUR = {
  /** Hover/press feedback. Must feel instant. */
  fast: 0.15,
  /** Small entrances: labels, badges, toasts. */
  base: 0.35,
  /** Scroll reveals — the default for content entering the viewport. */
  reveal: 0.6,
  /** The hero headline. Slower on purpose; it's the largest thing that moves. */
  hero: 0.7,
  /** Reserved for deliberate, long transitions. */
  slow: 0.8,
} as const

/** Stagger step for sequenced entrances. Small enough to read as one gesture. */
export const STAGGER_STEP = 0.09
