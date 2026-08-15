import { useEffect, useState } from 'react'

/**
 * Live theme switcher - a decision tool, not a feature.
 *
 * Four rounds of "make it more beautiful" were spent guessing at a direction and
 * asking for a verdict afterwards. This inverts that: three complete directions
 * ship at once, switchable in the browser, so the choice takes seconds instead of
 * another blind rebuild.
 *
 * Once a direction is chosen, this component and the two unused theme blocks in
 * index.css get deleted. It is scaffolding.
 */

const THEMES = [
  { id: 'midnight', label: 'Midnight', note: 'near-black · Inter · electric mint' },
  { id: 'editorial', label: 'Editorial', note: 'warm dark · Instrument Serif · amber' },
  { id: 'paper', label: 'Paper', note: 'cream · Archivo Black · blue (current)' },
] as const

type ThemeId = (typeof THEMES)[number]['id']

const STORAGE_KEY = 'loglens-portfolio-theme'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    if (saved && THEMES.some((t) => t.id === saved)) return saved
    // Default to Midnight: it is the biggest departure from what was here, and
    // the point of this exercise is to see a real difference.
    return 'midnight'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  // T cycles. Faster than reaching for the mouse when comparing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 't' && e.key !== 'T') return
      const target = e.target as HTMLElement
      if (target.matches('input, textarea, [contenteditable]')) return
      setTheme((current) => {
        const i = THEMES.findIndex((t) => t.id === current)
        return THEMES[(i + 1) % THEMES.length].id
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const active = THEMES.find((t) => t.id === theme)!

  return (
    <div className="fixed bottom-5 left-5 z-200 flex flex-col gap-2">
      <div className="flex overflow-hidden border border-line-strong bg-paper-raised">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            aria-pressed={theme === t.id}
            className={[
              'font-mono px-3 py-2 text-[0.65rem] tracking-widest uppercase',
              'transition-colors duration-[var(--dur-fast)]',
              theme === t.id
                ? 'bg-accent text-accent-ink'
                : 'text-ink-muted hover:text-ink',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="font-mono text-[0.6rem] tracking-wider text-ink-faint">
        {active.note} · press T
      </p>
    </div>
  )
}
