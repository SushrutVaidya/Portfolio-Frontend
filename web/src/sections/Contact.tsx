import { AnimatePresence, motion } from 'motion/react'
import { Bleed, Frame, Grid, col } from '@/components/layout/Frame'
import { Reveal } from '@/components/Reveal'
import { Magnetic } from '@/components/Magnetic'
import { Swap } from '@/components/Swap'
import { useRickroll } from '@/hooks/useRickroll'
import { elsewhere, profile } from '@/content/site'
import { DUR, EASE, STAGGER_STEP } from '@/lib/motion'

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

        {/* Elsewhere, given real room.
            This used to be a single flat row of six 11px mono words, which made
            the last thing on the page also the least designed thing on it. Now
            each destination is a register row: an ordinal, the label at heading
            scale swapping on hover, and one line on why you'd follow it. Same
            hover-dim device as the chapter register and the work index, so it's
            the third use of one interaction rather than a third invention. */}
        <nav aria-label="Elsewhere" className={`${col.full} mt-28`}>
          <h3 className="t-label">Elsewhere</h3>

          <ul className="register mt-7 border-t border-line">
            {elsewhere.map((link, i) => {
              const glyph = link.download ? '↓' : link.external ? '↗' : '→'
              return (
                <li key={link.label} className="register-row border-b border-line">
                  <Reveal delay={i * (STAGGER_STEP * 0.4)} distance={14}>
                    <a
                      href={link.href}
                      {...(link.external
                        ? { target: '_blank', rel: 'noreferrer noopener' }
                        : {})}
                      {...(link.download ? { download: true } : {})}
                      {...(link.rickroll ? { onClick: trigger } : {})}
                      // items-center, not items-baseline. Swap's clipping box
                      // has overflow:hidden, which makes it a scroll container,
                      // and a scroll container's flex baseline is synthesized
                      // from its bottom edge rather than its text — so every
                      // mono label in the row would sit a line too low.
                      className="group/swap group/row flex items-center gap-6 py-5 lg:gap-10"
                    >
                      <span
                        aria-hidden="true"
                        className="t-label w-6 shrink-0 transition-colors group-hover/row:text-accent"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <Swap className="t-heading">{link.label}</Swap>

                      <span className="t-label ml-auto hidden shrink-0 sm:block">
                        {link.note}
                      </span>

                      <span
                        aria-hidden="true"
                        className="t-label shrink-0 transition-transform duration-[var(--dur-base)] group-hover/row:translate-x-2"
                      >
                        {glyph}
                      </span>
                    </a>
                  </Reveal>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Colophon, in flow rather than a floating corner: the two bottom
            Corners here (name/year and a "React · Motion · nginx" strip) were
            margin decoration, and the second chained middots. One quiet prose
            line carries the same information. */}
        <p className={`${col.full} t-label mt-24`}>
          © {new Date().getFullYear()} {profile.name}. Built with React, Motion and nginx.
        </p>
      </Grid>

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
