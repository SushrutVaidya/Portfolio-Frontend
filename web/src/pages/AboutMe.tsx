import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Frame, Grid } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { SkillBar } from '@/components/SkillBar'
import { useStats } from '@/hooks/useStats'
import { api, type SteamGame } from '@/lib/api'
import { character, interests, lore, testimonial, traits, hueVar } from '@/content/aboutme'
import { profile } from '@/content/site'
import { DUR, EASE } from '@/lib/motion'

/**
 * About Me: the personal side.
 *
 * A complete rebuild of the old gaming-themed devquest/aboutme.html in the
 * playful design language, with real animation. The RPG wit is kept because
 * this is the "off the clock" page and it reads as humour. Live data where it
 * exists (the /api/stats "now" line, and the Steam library via /api/steam/games
 * with an honest empty state); the personality content is static and true.
 */
const tint = (h: string) => `color-mix(in oklab, ${hueVar(h)} 12%, white)`

export function AboutMe() {
  const reduce = useReducedMotion()
  const { stats, live } = useStats()
  const purple = { '--accent': 'var(--color-purple)' } as CSSProperties

  useEffect(() => {
    document.title = 'Sushrut Vaidya · off the clock'
    return () => {
      document.title = 'Sushrut Vaidya · Platform Engineer'
    }
  }, [])

  return (
    <div style={purple}>
      <main>
        {/* ═══ HERO: the character card ═══ */}
        <Frame full aria-labelledby="am-hero">
          <Grid className="items-center">
            <div className="col-span-4 lg:col-span-6">
              <Link to="/" className="t-label rule-in">
                ← Back to the portfolio
              </Link>
              <span className="t-label mt-8 block text-purple">Off the clock</span>
              <h1 id="am-hero" className="t-mega mt-3">
                The <span className="text-purple">other</span> side.
              </h1>
              <p className="t-sub mt-6 max-w-xl">{character.blurb}</p>
            </div>

            {/* An RPG-style character card: clearly a joke, clearly him. */}
            <motion.div
              className="col-span-4 lg:col-span-5 lg:col-start-8"
              initial={reduce ? undefined : { opacity: 0, y: 24, rotate: -1 }}
              animate={reduce ? undefined : { opacity: 1, y: 0, rotate: -1 }}
              transition={{ duration: DUR.smooth, ease: EASE, delay: 0.15 }}
            >
              <div className="card-pop bg-paper-raised p-7">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-line-strong font-display text-2xl font-extrabold"
                    style={{ backgroundColor: 'var(--color-purple)', color: '#fff' }}
                  >
                    SV
                  </div>
                  <div>
                    <div className="font-display text-xl font-extrabold text-ink">
                      {profile.name}
                    </div>
                    <div className="t-label mt-1">{character.location}</div>
                  </div>
                </div>
                <dl className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    ['Class', character.className],
                    ['Level', String(character.level)],
                    ['HP', character.hp],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-xl border-2 border-line-strong bg-paper px-3 py-2 text-center"
                    >
                      <dt className="t-label">{k}</dt>
                      <dd className="font-display mt-1 text-sm font-bold text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </motion.div>
          </Grid>
        </Frame>

        {/* ═══ CHARACTER STATS ═══ */}
        <Frame rule aria-labelledby="am-stats" style={{ backgroundColor: tint('purple') }}>
          <Grid>
            <div className="col-span-4 lg:col-span-4">
              <span className="t-label text-purple">Character stats</span>
              <h2 id="am-stats" className="t-display mt-4">
                Roughly self-assessed.
              </h2>
              <p className="t-body mt-5 max-w-sm text-ink-muted">
                Discipline is a work in progress, as the fitness bar will confirm.
              </p>
            </div>
            <div className="col-span-4 flex flex-col gap-6 lg:col-span-7 lg:col-start-6">
              {traits.map((t, i) => (
                <SkillBar key={t.name} name={t.name} value={t.value} hue={t.hue} delay={i * 0.08} />
              ))}
            </div>
          </Grid>
        </Frame>

        {/* ═══ INVENTORY / INTERESTS ═══ */}
        <Frame rule aria-labelledby="am-inv">
          <Grid>
            <div className="col-span-4 lg:col-span-12">
              <span className="t-label text-accent">Inventory</span>
              <h2 id="am-inv" className="t-display mt-4">
                What I collect.
              </h2>
            </div>
          </Grid>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {interests.map((it, i) => (
              <Reveal key={it.name} delay={i * 0.05}>
                <div className="card-pop h-full p-6" style={{ backgroundColor: tint(it.hue) }}>
                  <div className="flex items-center justify-between">
                    <span aria-hidden="true" className="text-4xl">
                      {it.emoji}
                    </span>
                    <span
                      className="t-label rounded-full border-2 border-line-strong bg-paper-raised px-3 py-1"
                      style={{ color: hueVar(it.hue) }}
                    >
                      {it.rarity}
                    </span>
                  </div>
                  <h3 className="t-heading mt-5">{it.name}</h3>
                  <p className="t-body mt-2 text-ink-muted">{it.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Frame>

        {/* ═══ NOW (live) ═══ */}
        <Frame rule aria-labelledby="am-now" style={{ backgroundColor: tint('blue') }}>
          <Grid>
            <div className="col-span-4 lg:col-span-12">
              <span className="t-label text-blue">Right now</span>
              <h2 id="am-now" className="t-display mt-4 max-w-4xl">
                Lately: {stats.game}, {stats.songName}, and {stats.bookName ?? 'a book'}.
              </h2>
              <p className="t-label mt-6">
                {live === null
                  ? 'checking…'
                  : live
                    ? 'live · pulled from /api/stats'
                    : 'cached · api unreachable'}
              </p>
            </div>
          </Grid>
        </Frame>

        {/* ═══ STEAM LIBRARY (live, honest empty state) ═══ */}
        <SteamShelf />

        {/* ═══ THE LORE ═══ */}
        <Frame rule aria-labelledby="am-lore">
          <Grid>
            <div className="col-span-4 lg:col-span-4">
              <span className="t-label text-accent">The lore</span>
              <h2 id="am-lore" className="t-display mt-4">
                Frequently asked.
              </h2>
            </div>
            <div className="col-span-4 lg:col-span-7 lg:col-start-6">
              <dl className="flex flex-col divide-y-2 divide-line">
                {lore.map((l, i) => (
                  <Reveal key={l.tag} delay={i * 0.05}>
                    <div className="flex flex-col gap-1 py-5 sm:flex-row sm:gap-8">
                      <dt className="t-label shrink-0 sm:w-40">{l.tag}</dt>
                      <dd className="t-sub text-ink">{l.text}</dd>
                    </div>
                  </Reveal>
                ))}
              </dl>

              <Reveal delay={0.2}>
                <figure
                  className="card-pop mt-10 p-7"
                  style={{ backgroundColor: tint('yellow') }}
                >
                  <blockquote className="t-heading">“{testimonial.quote}”</blockquote>
                  <figcaption className="t-label mt-4">— {testimonial.by}</figcaption>
                </figure>
              </Reveal>
            </div>
          </Grid>
        </Frame>

        {/* ═══ CLOSE ═══ */}
        <Frame rule tone="deep" aria-label="Back to work">
          <Grid>
            <div className="col-span-4 lg:col-span-12">
              <h2 className="t-display max-w-3xl">
                That is the person.
                <br />
                <span className="text-purple">The work is back this way.</span>
              </h2>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/#work" className="btn-pop bg-purple" style={{ color: '#fff' }}>
                  See the work
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href={`mailto:${profile.email}`}
                  className="btn-pop bg-paper-raised"
                  style={{ color: 'var(--color-ink)' }}
                >
                  Say hi
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </Grid>
        </Frame>
      </main>
    </div>
  )
}

/**
 * The Steam shelf. /api/steam/games returns [] in production (the key is unset),
 * so this is honest about it: it shows real games when configured, and a plain
 * "not wired up" note otherwise, rather than faking a library.
 */
function SteamShelf() {
  const [games, setGames] = useState<SteamGame[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .steamGames()
      .then((g) => !cancelled && setGames(g))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [])

  const hasGames = games && games.length > 0

  return (
    <Frame rule aria-labelledby="am-steam" style={{ backgroundColor: tint('green') }}>
      <Grid>
        <div className="col-span-4 lg:col-span-12">
          <span className="t-label text-green">Game library</span>
          <h2 id="am-steam" className="t-display mt-4">
            {hasGames ? 'Most hours, lately.' : 'Straight from Steam.'}
          </h2>
        </div>
      </Grid>

      {hasGames ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {games!.slice(0, 10).map((g, i) => (
            <Reveal key={g.appid} delay={i * 0.04}>
              <div className="card-pop h-full bg-paper-raised p-5">
                <div className="font-display text-3xl font-extrabold tabular-nums text-green">
                  {g.xp}
                  <span className="t-label ml-1">hrs</span>
                </div>
                <div className="mt-3 font-display font-bold text-ink">{g.title}</div>
                <div className="t-label mt-1">{g.played}</div>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="card-pop mt-8 max-w-xl bg-paper-raised p-7">
          <p className="t-sub text-ink">
            {failed
              ? 'Steam is not answering right now.'
              : 'The live Steam feed is not wired up on this deploy yet.'}{' '}
            The backend has the endpoint; it just needs a key. In the meantime: mostly
            Counter-Strike 2, and a backlog I am in denial about.
          </p>
          <a
            href="https://steamcommunity.com/profiles/76561199065609624"
            target="_blank"
            rel="noreferrer noopener"
            className="t-label rule-in mt-5 inline-block text-ink"
          >
            My Steam profile ↗
          </a>
        </div>
      )}
    </Frame>
  )
}
