import { AnimatePresence, motion } from 'motion/react'
import { Corner, Frame, Grid, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { Magnetic } from '@/components/Magnetic'
import { useRickroll } from '@/hooks/useRickroll'
import { links, profile } from '@/content/site'
import { DUR, EASE } from '@/lib/motion'

const ELSEWHERE = [
  { label: 'GitHub', href: links.github, external: true },
  { label: 'LinkedIn', href: links.linkedin, external: true },
  { label: 'Steam', href: links.steam, external: true },
  { label: 'DevQuest', href: links.devquest, external: false },
  { label: 'Résumé', href: profile.resume, external: false, download: true },
] as const

/**
 * Contact.
 *
 * The email address at display scale is the whole section. Previous versions had
 * a heading, a subheading, a button, a row of six links and a copyright line -
 * five competing elements for one instruction. Here the address IS the call to
 * action, and everything else is edge annotation.
 */
export function Contact() {
  const { trigger, victimNumber, dismiss } = useRickroll()

  return (
    <Frame full rule id="contact" aria-labelledby="contact-heading">
      <Corner at="top-left">06 — contact</Corner>

      <Grid>
        <div className={col.full}>
          <h2 id="contact-heading" className="t-label">
            Get in touch
          </h2>

          <Reveal>
            <Magnetic strength={8}>
              <a
                href={`mailto:${profile.email}`}
                className="t-display rule-in mt-8 inline-block normal-case"
              >
                {profile.email}
              </a>
            </Magnetic>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="t-sub mt-12 max-w-lg">
              Open to platform and backend roles. Happiest arguing about whether
              the thing needed Kubernetes.
            </p>
          </Reveal>
        </div>

        <nav aria-label="Elsewhere" className={`${col.full} mt-24`}>
          <ul className="flex flex-wrap gap-x-10 gap-y-3 border-t border-line pt-8">
            {ELSEWHERE.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(l.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                  {...('download' in l && l.download ? { download: true } : {})}
                  className="t-label rule-in"
                >
                  {l.label}
                  {l.external ? ' ↗' : ''}
                </a>
              </li>
            ))}
            <li>
              {/* The counter behind this is a real Redis-backed endpoint, which
                  is the joke. */}
              <a
                href={links.youtube}
                target="_blank"
                rel="noreferrer noopener"
                onClick={trigger}
                className="t-label rule-in"
              >
                Do not click ↗
              </a>
            </li>
          </ul>
        </nav>
      </Grid>

      <Corner at="bottom-left">
        {profile.name} · {new Date().getFullYear()}
      </Corner>
      <Corner at="bottom-right">React · Motion · nginx</Corner>

      {/* role="status" so it is announced without stealing focus. */}
      <AnimatePresence>
        {victimNumber !== null && (
          <motion.div
            role="status"
            className="fixed bottom-6 left-1/2 z-200 w-[min(92vw,24rem)] -translate-x-1/2 border border-line-strong bg-paper-raised p-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: DUR.base, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-5">
              <p className="t-body">
                Rickroll victim{' '}
                <span className="tabular-nums text-accent">#{victimNumber}</span>. Never
                gonna give you up.
              </p>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="t-label shrink-0 hover:text-ink"
              >
                close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Frame>
  )
}
