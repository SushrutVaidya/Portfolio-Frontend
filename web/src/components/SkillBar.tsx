import { motion, useReducedMotion } from 'motion/react'
import { hueVar } from '@/content/aboutme'

/**
 * A trait bar that fills from 0 to its value when it scrolls into view, with a
 * spring so it overshoots slightly and settles, and the number counting up in
 * step. Used on the About page for the self-aware character stats.
 */
export function SkillBar({
  name,
  value,
  hue,
  delay = 0,
}: {
  name: string
  value: number
  hue: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  const colour = hueVar(hue)

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display font-bold text-ink">{name}</span>
        <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: colour }}>
          {value}
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-line-strong bg-paper">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: colour }}
          initial={reduce ? { width: `${value}%` } : { width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.8 }}
          transition={
            reduce
              ? undefined
              : { duration: 0.9, ease: [0.34, 1.4, 0.64, 1], delay: delay + 0.1 }
          }
        />
      </div>
    </div>
  )
}
