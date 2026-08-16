import { AnimatePresence, motion } from 'motion/react'
import { Bleed, Corner, Folio, Frame, Grid, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { Magnetic } from '@/components/Magnetic'
import { useRickroll } from '@/hooks/useRickroll'
import { folio } from '@/content/chapters'
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
 * 06 — Contact.
 *
 * The address at mega scale IS the call to action. Previous versions had a
 * heading, a subheading, a button, a row of six links and a copyright line —
 * five competing elements delivering one instruction, which is how a closing
 * frame ends up being the weakest one on the page.
 *
 * Everything that remains is either the address or margin annotation.
 */
export function Contact() {
  const { trigger, victimNumber, dismiss } = useRickroll()

  return (
    <Frame full rule id="contact" aria-labelledby="contact-heading">
      <Folio index={folio('contact')} title="Contact" />

      <Grid>
        <div className={col.bleed}>
          <h2 id="contact-heading" className="t-label">
            Get in touch
          </h2>

          <Reveal>
            <Bleed className="mt-8">
              {/* Magnetic pull is small here deliberately: the target is nearly
                  the width of the frame, and a large offset on an element this
                  size reads as a bug rather than a response.

                  Set at t-display rather than t-mega. A 21-character address at
                  mega scale is wider than any viewport, and the only ways out
                  are breaking it mid-word or letting it overflow — both worse
                  than one step down the scale. */}
              <Magnetic strength={6}>
                <a
                  href={`mailto:${profile.email}`}
                  className="t-display rule-in-thick inline-block break-words"
                >
                  {profile.email}
                </a>
              </Magnetic>
            </Bleed>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="t-sub mt-14 max-w-lg">
              Open to platform and backend roles. Happiest arguing about whether the thing
              needed Kubernetes.
            </p>
          </Reveal>
        </div>

        <nav aria-label="Elsewhere" className={`${col.full} mt-24`}>
          <ul className="flex flex-wrap gap-x-10 gap-y-3 border-t border-line pt-8">
            {ELSEWHERE.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...(link.external
                    ? { target: '_blank', rel: 'noreferrer noopener' }
                    : {})}
                  {...('download' in link && link.download ? { download: true } : {})}
                  className="t-label rule-in"
                >
                  {link.label}
                  {link.external ? ' ↗' : ''}
                </a>
              </li>
            ))}
            <li>
              {/* The counter behind this is a real Redis-backed endpoint, which
                  is the entire joke. */}
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
      {/* Hidden below sm: both labels run to ~150px at 11px mono with 0.18em
          tracking, and a 375px viewport minus the frame inset leaves 327px for
          the pair. They overlapped. */}
      <Corner at="bottom-right" className="hidden sm:block">
        React · Motion · nginx
      </Corner>

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
