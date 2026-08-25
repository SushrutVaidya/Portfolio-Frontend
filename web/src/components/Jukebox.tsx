import { useEffect, useRef, useState } from 'react'
import { api, type JukeboxTrack } from '@/lib/api'
import { tracks as FALLBACK } from '@/content/aboutme'

/**
 * Jukebox: the music player from the old About page, rebuilt honestly.
 *
 * Pulls the real /api/jukebox/tracks. If a track has an audioURL it actually
 * plays (one <audio>, play/pause, one track at a time). If the endpoint is
 * unreachable it falls back to the real OST rotation as a still "on repeat"
 * list, with no fake play button, so it never pretends to play audio it does
 * not have.
 */

type Row = { title: string; from: string; audioURL?: string }

export function Jukebox() {
  const [rows, setRows] = useState<Row[]>(FALLBACK.map((t) => ({ ...t })))
  const [live, setLive] = useState(false)
  const [playing, setPlaying] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let cancelled = false
    const el = audioRef.current
    api
      .jukeboxTracks()
      .then((data: JukeboxTrack[]) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return
        setRows(
          data.map((t) => ({
            title: t.title ?? 'Untitled',
            from: t.artist ?? (typeof t.game === 'string' ? t.game : ''),
            audioURL: t.audioURL,
          }))
        )
        setLive(true)
      })
      .catch(() => {})
    return () => {
      cancelled = true
      el?.pause()
    }
  }, [])

  function toggle(i: number, url?: string) {
    if (!url) return
    const el = audioRef.current
    if (!el) return
    if (playing === i) {
      el.pause()
      setPlaying(null)
      return
    }
    el.src = url
    el.volume = 0.6
    void el.play().then(
      () => setPlaying(i),
      () => setPlaying(null)
    )
  }

  const anyAudio = rows.some((r) => r.audioURL)

  return (
    <div className="card-pop overflow-hidden bg-paper-raised">
      {/* Boombox header. */}
      <div className="flex items-center gap-3 border-b-2 border-line-strong px-5 py-3">
        <span aria-hidden="true" className="flex items-end gap-0.5" title="equaliser">
          {[0, 1, 2, 3].map((b) => (
            <span
              key={b}
              className={`w-1 rounded-full ${playing !== null ? 'jb-eq' : ''}`}
              style={{
                height: playing !== null ? undefined : '6px',
                backgroundColor: 'var(--color-purple)',
                animationDelay: `${b * 0.12}s`,
              }}
            />
          ))}
        </span>
        <span className="t-label text-ink">Jukebox</span>
        <span className="t-label ml-auto">{live ? 'live · /api/jukebox' : 'on repeat'}</span>
      </div>

      <audio ref={audioRef} onEnded={() => setPlaying(null)} className="hidden" />

      <ul className="divide-y-2 divide-line">
        {rows.map((r, i) => {
          const isPlaying = playing === i
          const canPlay = Boolean(r.audioURL)
          return (
            <li key={`${r.title}-${i}`}>
              <button
                type="button"
                onClick={() => toggle(i, r.audioURL)}
                disabled={!canPlay}
                aria-label={canPlay ? `Play ${r.title}` : r.title}
                className={`flex w-full items-center gap-4 px-5 py-3 text-left transition-colors ${
                  canPlay ? 'hover:bg-paper' : 'cursor-default'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-line-strong font-mono text-xs"
                  style={
                    isPlaying
                      ? { backgroundColor: 'var(--color-purple)', color: '#fff' }
                      : { backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }
                  }
                >
                  {canPlay ? (isPlaying ? '❚❚' : '▶') : '♪'}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display font-bold text-ink">{r.title}</span>
                  {r.from && <span className="t-label block truncate">{r.from}</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {!anyAudio && (
        <p className="t-label border-t-2 border-line-strong px-5 py-3">
          Tracklist only here. The audio lives on the backend feed.
        </p>
      )}
    </div>
  )
}
