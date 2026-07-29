/**
 * The single API layer for the portfolio front end.
 *
 * There is deliberately no API_BASE branching here. The old vanilla site had
 * five near-identical `API_BASE` IIFEs (js/main.js plus four devquest modules),
 * and js/main.js's copy had drifted — it was missing the port-8888 branch, so
 * the landing page and the devquest pages disagreed about where the API lived
 * during local e2e runs.
 *
 * Instead, /api is always same-origin:
 *   - dev:  vite.config.ts `server.proxy` forwards /api to localhost:8081
 *   - prod: nginx.conf `location ~ ^/(api|clips|audio|...)/ ` proxies to the
 *           portfolio-backend container
 *
 * Types below mirror the Java models exactly (see Portfolio-Backend
 * src/main/java/com/sushrut/portfolio/backend/model/).
 */

/** Mirrors StatsResponse.java */
export interface Stats {
  location: string
  game: string
  /** Server-rendered time. The UI ignores this and runs a client clock, matching the old behaviour. */
  currentTime: string
  timeStamp: number
  songName: string
  songURL: string
  bookName: string | null
}

/** Mirrors SteamGameResponse.java. Note `xp` is *hours* — SteamService does Math.round(minutes/60). */
export interface SteamGame {
  title: string
  xp: number
  /** "Recently" | "A while ago" — derived from playtime_2weeks, not a date. */
  played: string
  appid: number
}

/** Mirrors JukeboxTrack.java */
export interface JukeboxTrack {
  title?: string
  artist?: string
  audioURL?: string
  [key: string]: unknown
}

export interface RickrollCount {
  count: number
}

export interface PrintRequestCount {
  claimed: number
  remaining: number
  full: boolean
}

/** Leaderboard rows are Map<String,Object> server-side, so keep this loose. */
export type LeaderboardRow = Record<string, unknown>

class ApiError extends Error {
  // Explicit fields rather than constructor parameter properties — the Vite
  // template enables `erasableSyntaxOnly`, which forbids that shorthand.
  readonly status: number
  readonly path: string

  constructor(status: number, path: string) {
    super(`API ${status} on ${path}`)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { Accept: 'application/json', ...init?.headers } })
  if (!res.ok) throw new ApiError(res.status, path)
  return (await res.json()) as T
}

export const api = {
  /** GET /api/stats — hero sentence data. */
  stats: () => get<Stats>('/api/stats'),

  /** GET /api/rickroll — increments the counter. Side-effecting despite being a GET. */
  rickroll: () => get<RickrollCount>('/api/rickroll'),

  /** GET /api/rickroll/count — read-only. */
  rickrollCount: () => get<RickrollCount>('/api/rickroll/count'),

  /**
   * GET /api/steam/games — top 10 by playtime.
   *
   * Returns [] when STEAM_API_KEY / STEAM_ID are unset, which is the case in
   * production today: SteamService builds the Steam URL with an empty key, the
   * call fails, and it caches the empty list for 2 minutes. Callers must treat
   * [] as "not configured" rather than "owns no games".
   */
  steamGames: () => get<SteamGame[]>('/api/steam/games'),

  /** GET /api/jukebox/tracks */
  jukeboxTracks: () => get<JukeboxTrack[]>('/api/jukebox/tracks'),

  /** GET /api/leaderboard — note: NOT /api/gaming/leaderboard, which never existed. */
  leaderboard: () => get<LeaderboardRow[]>('/api/leaderboard'),

  /** GET /api/print-request/count */
  printRequestCount: () => get<PrintRequestCount>('/api/print-request/count'),
}

export { ApiError }

/**
 * Stats shown when /api/stats is unreachable. The old site did this inline
 * (js/main.js:70-87) and it matters: the hero sentence is the first thing on
 * the page, so it must never render empty.
 */
export const STATS_FALLBACK: Stats = {
  location: 'hyderabad',
  game: 'counter-strike 2',
  currentTime: '',
  timeStamp: 0,
  songName: 'your favorite song',
  songURL: '',
  bookName: 'this book',
}
