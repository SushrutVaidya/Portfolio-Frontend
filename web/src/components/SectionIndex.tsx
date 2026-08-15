import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

const SECTIONS = [
  { id: 'hero', label: 'Top' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'stack', label: 'Stack' },
  { id: 'patent', label: 'Patent' },
  { id: 'contact', label: 'Contact' },
] as const

/**
 * Sticky section index.
 *
 * The numbered side-rail from atulkhola.com. On a long editorial page it does
 * real work: it tells you how many sections exist, which one you're in, and
 * gives one-click access — all things a plain scroll page hides.
 *
 * Uses IntersectionObserver rather than scroll maths so it stays correct when
 * section heights differ (the showcase section is several viewports tall). The
 * observer picks the entry closest to the top of the viewport, which avoids the
 * flicker you get when two sections are visible at once.
 *
 * Hidden below lg, where there's no gutter to put it in, and hidden from
 * assistive tech because the same links exist in the document flow — a duplicate
 * nav is noise for a screen reader.
 */
export function SectionIndex() {
  const [active, setActive] = useState<string>('hero')
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const height = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    )
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))
        if (visible[0]) setActive(visible[0].target.id)
      },
      // A band across the upper-middle of the viewport, so "active" means
      // "what you're reading" rather than "what has entered the screen".
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-hidden="true"
      className="fixed top-1/2 right-6 z-90 hidden -translate-y-1/2 lg:block"
    >
      <div className="relative flex flex-col gap-3 pl-4">
        {/* Progress spine */}
        <div className="absolute top-0 left-0 h-full w-0.5 bg-black/15">
          {!reduceMotion && (
            <motion.div
              className="w-full origin-top bg-accent"
              style={{ height }}
            />
          )}
        </div>

        {SECTIONS.map((section, i) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            tabIndex={-1}
            className="group flex items-center gap-2"
          >
            <span
              className={[
                'font-mono text-[0.6rem] tracking-widest transition-all duration-[var(--dur-fast)]',
                active === section.id
                  ? 'text-accent opacity-100'
                  : 'opacity-35 group-hover:opacity-70',
              ].join(' ')}
            >
              {String(i).padStart(2, '0')}
            </span>
            <span
              className={[
                'font-mono text-[0.65rem] transition-all duration-[var(--dur-fast)]',
                active === section.id
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60',
              ].join(' ')}
            >
              {section.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  )
}
