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

/**
 * The gaming corner, restored from the old page but made honest.
 *
 * `tracks` is the OST rotation used as a fallback when /api/jukebox/tracks is
 * unreachable: these are real game soundtracks, so listing them is true even
 * without audio. `regulars` are games actually played, WITHOUT the invented
 * hour counts the old page faked. `jokeStats` and the leaderboard are kept as
 * openly comedic bits (they read as humour, not telemetry), which is the only
 * honest way to reproduce data that never had a backend.
 */
export const tracks = [
  { title: 'Corridors of Time', from: 'Chrono Trigger' },
  { title: 'Weight of the World', from: 'NieR: Automata' },
  { title: 'To Zanarkand', from: 'Final Fantasy X' },
  { title: 'One-Winged Angel', from: 'Final Fantasy VII' },
  { title: 'Dragonborn', from: 'Skyrim' },
  { title: 'Megalovania', from: 'Undertale' },
] as const

export const regulars = [
  { name: 'Counter-Strike 2', emoji: '🔫' },
  { name: 'Elden Ring', emoji: '⚔️' },
  { name: 'Hades', emoji: '🔥' },
  { name: 'Hollow Knight', emoji: '🦋' },
  { name: 'Stardew Valley', emoji: '🌾' },
  { name: 'Sekiro', emoji: '🗡️' },
] as const

// Deliberately unscientific: framed as a joke, not a metric.
export const jokeStats = [
  { label: 'Malenia attempts', value: '47', note: 'and counting', hue: 'red' },
  { label: 'Backlog', value: 'growing', note: 'faster than I play', hue: 'purple' },
  { label: 'Rage quits', value: 'classified', note: 'for legal reasons', hue: 'yellow' },
  { label: 'Completion rate', value: 'optimistic', note: 'we do not talk about it', hue: 'green' },
] as const

// A leaderboard that is honestly a bit: it is about me, not fake strangers.
export const leaderboard = [
  { rank: 1, name: 'The backlog', note: 'undefeated' },
  { rank: 2, name: 'The 6am alarm', note: 'also undefeated' },
  { rank: 3, name: 'Me', note: 'trying my best' },
  { rank: 4, name: 'Malenia', note: 'rent free' },
] as const

