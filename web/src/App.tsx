import { useEffect, useRef, useState } from 'react'
import { animate, inView, stagger } from 'motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, STATS_FALLBACK, type Stats } from '@/lib/api'

/**
 * Phase 1 smoke test — NOT the final design.
 *
 * Exists to prove the foundation end to end: RetroUI theme tokens resolve, the
 * four fonts load, components render with warm-black borders and hard offset
 * shadows, Motion's animate/stagger/inView work, and the API layer degrades to
 * STATS_FALLBACK when the backend is down.
 */
export default function App() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [live, setLive] = useState<boolean | null>(null)
  const greetingRef = useRef<HTMLDivElement>(null)
  const bandsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api
      .stats()
      .then((s) => {
        setStats(s)
        setLive(true)
      })
      .catch(() => {
        setStats(STATS_FALLBACK)
        setLive(false)
      })
  }, [])

  // Staggered multilingual greeting — the seed of the hero sequence.
  useEffect(() => {
    const els = greetingRef.current?.querySelectorAll('[data-greeting]')
    if (!els?.length) return
    animate(
      els,
      { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
      { delay: stagger(0.12), duration: 0.6, ease: [0.19, 1, 0.22, 1] }
    )
  }, [])

  // Scroll-driven accent swap, replacing the IntersectionObserver in js/main.js:257.
  useEffect(() => {
    const bands = bandsRef.current?.querySelectorAll('[data-accent]')
    if (!bands?.length) return
    const stops: Array<() => void> = []
    bands.forEach((band) => {
      const stop = inView(
        band,
        (el) => {
          const accent = (el as HTMLElement).dataset.accent
          if (accent) document.documentElement.style.setProperty('--section-accent', accent)
          animate(
            el,
            { opacity: [0, 1], transform: ['translateY(32px)', 'translateY(0px)'] },
            { duration: 0.6, ease: [0.19, 1, 0.22, 1] }
          )
        },
        { amount: 0.4 }
      )
      stops.push(stop)
    })
    return () => stops.forEach((s) => s())
  }, [stats])

  return (
    <main className="min-h-dvh px-6 py-16 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div ref={greetingRef} className="mb-4 flex flex-wrap gap-x-6 gap-y-1">
          {['hello', 'नमस्कार', 'నమస్కారం', 'ನಮಸ್ಕಾರ'].map((g) => (
            <span key={g} data-greeting className="font-head text-xl opacity-0 md:text-2xl">
              {g}
            </span>
          ))}
        </div>

        <h1 className="text-6xl leading-[0.85] md:text-8xl lg:text-9xl">Sushrut Vaidya</h1>

        <p className="font-pixel mt-6 text-xs tracking-widest uppercase">
          Phase 1 · foundation smoke test
        </p>

        <Card className="mt-10 border-2 p-6 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={live ? 'default' : 'outline'}>
              {live === null ? 'checking…' : live ? '/api/stats live' : 'fallback (backend down)'}
            </Badge>
            <span className="font-mono text-sm">
              {stats ? `${stats.location} · ${stats.game} · ${stats.songName}` : 'loading…'}
            </span>
          </div>
        </Card>

        <div ref={bandsRef} className="mt-12 space-y-4">
          {[
            { accent: '#0b24fb', stock: 'bg-paper-100', label: 'hero' },
            { accent: '#fc0', stock: 'bg-paper-200', label: 'about' },
            { accent: '#ff3838', stock: 'bg-paper-300', label: 'interests' },
            { accent: '#2ed573', stock: 'bg-paper-400', label: 'stack' },
            { accent: '#9b59b6', stock: 'bg-paper-200', label: 'patent' },
          ].map((b) => (
            <section
              key={b.label}
              data-accent={b.accent}
              className={`${b.stock} flex items-center justify-between border-2 p-6 opacity-0 shadow-md`}
            >
              <span className="font-head text-2xl">{b.label}</span>
              <span className="size-10 border-2" style={{ background: b.accent }} aria-hidden="true" />
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <button className="retro-press font-head border-2 bg-[var(--section-accent)] px-6 py-2 text-secondary-foreground shadow-md">
            retro-press
          </button>
        </div>

        <p className="mt-16 max-w-prose font-sans text-sm text-muted-foreground">
          Accent swaps as each band scrolls into view via Motion&apos;s{' '}
          <code className="font-mono">inView</code>, writing{' '}
          <code className="font-mono">--section-accent</code> on{' '}
          <code className="font-mono">:root</code>.
        </p>
      </div>
    </main>
  )
}
