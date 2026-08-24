import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { EASE } from '@/lib/motion'

/**
 * Forge, the "consecration" animation.
 *
 * Forge has no product UI to show, but it has something better: its DI
 * annotation is literally `@Omnissiah` (dev.forge.core.annotation.Omnissiah,
 * the Adeptus Mechanicus Machine God). So instead of a faked screenshot this
 * animates the framework's REAL mechanism in that flavour: a class marked with
 * `@Omnissiah` is discovered and wired down through Forge's actual pipeline
 * (component scanner into the DI container into the agent/tool registries, the
 * prompt engine, the provider layer, the runtime), each stage lighting in turn
 * on a loop. The cog turns while it runs.
 *
 * Everything shown is true to the repo: the annotation exists, the pipeline is
 * the README's architecture, and the code sample is the README's stated goal
 * (labelled as such). Only the theming is dramatised, and it is Forge's own.
 */

const STAGES = [
  { label: 'Component scanner', sub: 'finds @Omnissiah classes' },
  { label: 'DI container', sub: 'bean registry + injection' },
  { label: 'Agent & tool registry', sub: 'AI components as beans' },
  { label: 'Prompt engine', sub: 'templates + context' },
  { label: 'LLM provider layer', sub: 'vendor-agnostic' },
  { label: 'AI runtime', sub: 'the agent awakens' },
] as const

const PURPLE = 'var(--color-purple)'

function Cog({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-6 w-6 ${spinning ? 'animate-spin [animation-duration:9s]' : ''}`}
      style={{ color: PURPLE }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      {/* A clean gear: on-theme for the Mechanicus cog without attempting the
          full cog-skull, which would look amateur at this size. */}
      <path
        d="M12 2.2l1.2 2.1a7.8 7.8 0 011.9.8l2.3-.6 1.4 2.4-1.6 1.8c.1.35.1.7.1 1s0 .65-.1 1l1.6 1.8-1.4 2.4-2.3-.6a7.8 7.8 0 01-1.9.8L12 21.8l-1.2-2.1a7.8 7.8 0 01-1.9-.8l-2.3.6-1.4-2.4 1.6-1.8a7 7 0 010-2l-1.6-1.8 1.4-2.4 2.3.6a7.8 7.8 0 011.9-.8L12 2.2z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function ForgeRitual() {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  // -1 = idle; 0..STAGES.length-1 = the wave position; STAGES.length = "online".
  const [active, setActive] = useState(reduceMotion ? STAGES.length : -1)

  useEffect(() => {
    if (reduceMotion) {
      setActive(STAGES.length)
      return
    }
    if (!inView) return
    let step = -1
    const tick = () => {
      step = step + 1 > STAGES.length + 1 ? 0 : step + 1
      setActive(step)
    }
    tick()
    const id = window.setInterval(tick, 700)
    return () => window.clearInterval(id)
  }, [inView, reduceMotion])

  const running = active >= 0 && active <= STAGES.length

  return (
    <div
      ref={ref}
      className="card-pop overflow-hidden"
      style={{ backgroundColor: 'color-mix(in oklab, var(--color-purple) 10%, white)' }}
    >
      {/* Header: cog + litany. */}
      <div className="flex items-center gap-3 border-b-2 border-line-strong px-5 py-3">
        <Cog spinning={running} />
        <span className="t-label text-ink">The Machine God discovers what is marked</span>
        <span
          className="t-label ml-auto"
          style={{ color: active >= STAGES.length ? PURPLE : 'var(--color-ink-faint)' }}
        >
          {active >= STAGES.length ? 'online' : 'consecrating'}
        </span>
      </div>

      {/* The marked class: the README's stated goal, labelled as such. */}
      <div className="border-b-2 border-line-strong bg-paper-deep px-5 py-4 font-mono text-[0.78rem] leading-relaxed" style={{ color: '#e9e6dd' }}>
        <motion.span
          className="block font-semibold"
          style={{ color: PURPLE }}
          animate={running && active === 0 ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          @Omnissiah
        </motion.span>
        <span className="block">
          <span style={{ color: '#7f9cf5' }}>class</span> WeatherAgent {'{'}
        </span>
        <span className="block pl-4" style={{ color: '#807b70' }}>
          @Tool getWeather() … @Prompt systemPrompt() …
        </span>
        <span className="block">{'}'}</span>
      </div>

      {/* The pipeline: each stage lights as the wave passes. */}
      <ol className="p-5">
        {STAGES.map((stage, i) => {
          const lit = active > i || active >= STAGES.length
          const isWave = active === i
          return (
            <li key={stage.label} className="relative flex items-start gap-3 pb-4 last:pb-0">
              {/* Rail + dot. */}
              <div className="relative flex flex-col items-center self-stretch">
                <motion.span
                  className="mt-1 h-3 w-3 shrink-0 rounded-full border-2"
                  style={{ borderColor: PURPLE }}
                  animate={{
                    backgroundColor: lit ? PURPLE : 'rgba(0,0,0,0)',
                    scale: isWave ? [1, 1.5, 1] : 1,
                  }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
                {i < STAGES.length - 1 && (
                  <span
                    className="mt-1 w-0.5 flex-1"
                    style={{ backgroundColor: lit ? PURPLE : 'var(--color-line)' }}
                  />
                )}
              </div>
              <div className="pb-1">
                <span
                  className="font-display font-bold transition-colors"
                  style={{ color: lit ? 'var(--color-ink)' : 'var(--color-ink-faint)' }}
                >
                  {String(i + 1).padStart(2, '0')} {stage.label}
                </span>
                <span className="t-label ml-2 lowercase">{stage.sub}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
