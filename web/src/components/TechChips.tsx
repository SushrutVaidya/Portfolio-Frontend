import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { TECH_ICONS } from '@/lib/techIcons'

/**
 * TechChips: the stack as labelled chips that "dance".
 *
 * Earlier this was logo-only flip tiles, which failed the one test that matters:
 * most people cannot name a tool from its mark alone. So each chip now shows the
 * real brand logo AND its name, always readable. The "dance" is a travelling
 * wave: the chip at the wave head lifts, tints to its brand colour, and its logo
 * goes full-colour, then settles. Character without hiding the information.
 *
 * Real marks (simple-icons, inlined), self-hosted, no AI art. Under
 * prefers-reduced-motion the chips are static and fully legible.
 */
export function TechChips() {
  const reduce = useReducedMotion()
  const [head, setHead] = useState(-1)

  useEffect(() => {
    if (reduce) return
    let i = -1
    const id = window.setInterval(() => {
      i = i + 1 >= TECH_ICONS.length ? -1 : i + 1
      setHead(i)
    }, 420)
    return () => window.clearInterval(id)
  }, [reduce])

  return (
    <ul className="flex flex-wrap gap-2.5" aria-label="Core stack">
      {TECH_ICONS.map((icon, i) => {
        const active = i === head
        return (
          <li
            key={icon.label}
            className="card-pop flex items-center gap-2 py-1.5 pr-3.5 pl-2.5"
            style={{
              backgroundColor: active
                ? `color-mix(in oklab, ${icon.hex} 16%, white)`
                : 'var(--color-paper-raised)',
              transform: active && !reduce ? 'translateY(-4px)' : 'translateY(0)',
              transition: reduce
                ? undefined
                : 'transform var(--dur-base) var(--ease-pop), background-color var(--dur-base) var(--ease)',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
              fill={active ? icon.hex : 'var(--color-ink)'}
              aria-hidden="true"
            >
              <path d={icon.path} />
            </svg>
            <span className="font-display text-sm font-bold text-ink">{icon.label}</span>
          </li>
        )
      })}
    </ul>
  )
}
