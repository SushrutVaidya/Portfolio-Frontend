import { AnimatePresence, motion } from 'motion/react'
import { Reveal } from '@/components/Reveal'
import { SplitText } from '@/components/SplitText'
import { Magnetic } from '@/components/Magnetic'
import { useRickroll } from '@/hooks/useRickroll'
import { links, profile } from '@/content/site'
import { DUR, EASE } from '@/lib/motion'

const SOCIALS = [
  { key: 'github', label: 'GitHub', href: links.github, external: true },
  { key: 'linkedin', label: 'LinkedIn', href: links.linkedin, external: true },
  { key: 'steam', label: 'Steam', href: links.steam, external: true },
  { key: 'devquest', label: 'DevQuest', href: links.devquest, external: false },
] as const

/**
 * Footer.
 *
 * The rickroll stays. It's a joke with a real Redis-backed counter behind it,
 * and the toast reports your actual victim number — which is a better
 * demonstration of "I wire things up properly" than a paragraph claiming so.
 */
export function Footer() {
  const { trigger, victimNumber, dismiss } = useRickroll()

  return (
    <footer
      id="contact"
      className="bg-paper-raised border-t border-line px-6 py-20 md:px-12 md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <h2 className="t-heading">
            <SplitText>Let&apos;s build something</SplitText>
            <span className="font-sans mt-4 block text-base font-normal normal-case tracking-normal text-muted-foreground md:text-xl">
              or just argue about whether Kubernetes was necessary
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <Magnetic strength={14}>
          <a
            href={`mailto:${profile.email}`}
            className="font-display mt-10 inline-block border border-line bg-accent px-6 py-4 text-lg text-accent-ink shadow-lg transition-[transform,box-shadow] duration-[var(--dur-fast)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl active:translate-x-0 active:translate-y-0 active:shadow-sm  md:text-2xl"
          >
            {profile.email}
          </a>
          </Magnetic>
        </Reveal>

        <Reveal delay={0.12}>
          <nav aria-label="Elsewhere" className="mt-12 flex flex-wrap gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.key}
                href={s.href}
                {...(s.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                className="font-mono border border-line bg-card px-4 py-2 text-sm shadow-sm transition-[transform,box-shadow] duration-[var(--dur-fast)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md "
              >
                {s.label}
                {s.external && ' ↗'}
              </a>
            ))}
            <a
              href={profile.resume}
              download
              className="font-mono border border-line bg-card px-4 py-2 text-sm shadow-sm transition-[transform,box-shadow] duration-[var(--dur-fast)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md "
            >
              Résumé
            </a>
            {/* The counter increments server-side on click; the count is read
                back when you return to the tab. See useRickroll. */}
            <a
              href={links.youtube}
              target="_blank"
              rel="noreferrer noopener"
              onClick={trigger}
              className="font-mono border border-line bg-card px-4 py-2 text-sm shadow-sm transition-[transform,box-shadow] duration-[var(--dur-fast)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md "
            >
              Do not click ↗
            </a>
          </nav>
        </Reveal>

        <p className="t-label mt-20">
          {profile.name} · {new Date().getFullYear()} · Built with React, Motion and too much
          attention to nginx
        </p>
      </div>

      {/* Rickroll toast. role="status" so it's announced without stealing focus. */}
      <AnimatePresence>
        {victimNumber !== null && (
          <motion.div
            role="status"
            className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 border border-line bg-primary p-4 shadow-xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: DUR.base, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm">
                You&apos;re rickroll victim{' '}
                <span className="font-display tabular-nums">#{victimNumber}</span>. Never gonna give
                you up.
              </p>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="font-display shrink-0 border border-line bg-card px-2 leading-tight "
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  )
}
