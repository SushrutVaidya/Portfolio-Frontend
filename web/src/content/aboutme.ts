/**
 * About Me content: the personal side of Sushrut.
 *
 * Ported from the old gaming-themed devquest/aboutme.html (being scrapped), with
 * the wit kept and the copy cleaned (no em-dashes). The RPG framing (Level 24,
 * HP, rarities) is deliberate personality for a PERSONAL page, not a claim: it
 * reads as humour, which is the point of an "off the clock" page.
 */

export const character = {
  className: 'Backend Dev',
  level: 24,
  hp: '420 / 420',
  location: 'Hyderabad, IN',
  blurb:
    'The person behind the platform engineering. Anime encyclopaedia, biryani partisan, and permanently one week away from starting a gym arc.',
} as const

/** Self-aware trait bars, 0..100. These are character, not a skills matrix. */
export const traits = [
  { name: 'Curiosity', value: 88, hue: 'blue' },
  { name: 'Humour', value: 92, hue: 'yellow' },
  { name: 'Creativity', value: 85, hue: 'purple' },
  { name: 'Discipline', value: 70, hue: 'green' },
  { name: 'Adventure', value: 78, hue: 'red' },
] as const

/** Interests, kept as an "inventory" with rarities for the joke. */
export const interests = [
  {
    emoji: '🎌',
    name: 'Anime',
    rarity: 'Legendary',
    hue: 'yellow',
    desc: 'Gintama, Naruto, AOT, and counting. 367 episodes of Gintama alone.',
  },
  {
    emoji: '🎮',
    name: 'Gaming',
    rarity: 'Epic',
    hue: 'purple',
    desc: 'Steam library growing faster than my backlog. Send help.',
  },
  {
    emoji: '🎧',
    name: 'Music',
    rarity: 'Rare',
    hue: 'blue',
    desc: 'Lo-fi beats for coding, Bollywood bangers for everything else.',
  },
  {
    emoji: '✈️',
    name: 'Travel',
    rarity: 'Epic',
    hue: 'purple',
    desc: 'Next destination: always planning. Passport collecting dust, though.',
  },
  {
    emoji: '🍜',
    name: 'Food',
    rarity: 'Legendary',
    hue: 'yellow',
    desc: 'Biryani is a love language. Hyderabadi, of course. Do not start a debate.',
  },
  {
    emoji: '💪',
    name: 'Fitness',
    rarity: 'Common',
    hue: 'green',
    desc: "Gym arc in progress. Currently in the 'thinking about going' phase.",
  },
] as const

/** "The Lore": short answers, dialogue-style. */
export const lore = [
  { tag: 'Favourite anime', text: 'Gintama. Obviously. If you know, you know.' },
  { tag: 'Favourite food', text: 'Biryani, Hyderabadi, of course. Do not start a debate.' },
  { tag: 'Fun fact', text: 'Can quote entire Gintama episodes from memory. It is a skill.' },
  { tag: 'On repeat', text: 'Lo-fi while shipping, Bollywood while everything else.' },
] as const

/** A friend's testimonial, kept because it is funnier than anything I'd write. */
export const testimonial = {
  quote: 'He once spent three hours debugging a missing semicolon. Respect.',
  by: 'A friend',
} as const

/** Rarity/trait hue helper. */
export const hueVar = (h: string) => `var(--color-${h})`
