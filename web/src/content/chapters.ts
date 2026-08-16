/**
 * Chapter register.
 *
 * The single source of truth for the page's structure, consumed by both the
 * navigation overlay and each section's own corner folio. Numbering used to be
 * hard-coded twice — once in the nav, once as a string literal in each section —
 * and it had already drifted by one on a previous build. Deriving both from this
 * array makes that class of bug impossible.
 *
 * The intro deliberately has no number. It's the cover, and a cover carries no
 * folio.
 */

export interface Chapter {
  /** Element id, and the anchor target. */
  id: string
  /** Two-digit folio, printed in mono. */
  index: string
  /** Set in the serif at display scale in the nav overlay. */
  title: string
  /** One line of mono beneath it — what the chapter actually contains. */
  note: string
}

export const chapters: readonly Chapter[] = [
  { id: 'now', index: '01', title: 'Now', note: 'live state, read from the API' },
  { id: 'work', index: '02', title: 'Work', note: 'three systems, with write-ups' },
  { id: 'practice', index: '03', title: 'Practice', note: 'the role, and what came of it' },
  { id: 'stack', index: '04', title: 'Stack', note: 'grouped by what it buys' },
  { id: 'patent', index: '05', title: 'Patent', note: 'granted, Government of India' },
  { id: 'contact', index: '06', title: 'Contact', note: 'one address' },
] as const

/** Folio lookup, so a section can't disagree with the nav about its number. */
export function folio(id: string): string {
  return chapters.find((c) => c.id === id)?.index ?? ''
}
