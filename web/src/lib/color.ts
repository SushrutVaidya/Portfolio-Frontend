/**
 * Contrast utilities.
 *
 * The accent colour changes per section and per project, so any text sitting on
 * it needs a foreground chosen from the accent — not hardcoded. Hardcoding
 * text-white gave unreadable labels on the yellow (#ffdc58) and green (#2ed573)
 * accents while looking fine on blue (#0b24fb).
 */

const INK_DARK = '#2d2a24'
const INK_LIGHT = '#fff7e8'

function channel(value: number): number {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/**
 * Pick the readable ink for a background.
 *
 * Threshold 0.42 rather than the usual 0.5: the warm dark ink is #2d2a24 rather
 * than pure black, so it stays legible slightly further up the luminance range
 * than a naive midpoint would allow.
 */
export function contrastInk(background: string): string {
  return luminance(background) > 0.42 ? INK_DARK : INK_LIGHT
}
