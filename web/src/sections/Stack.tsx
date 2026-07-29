import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { Pinned } from '@/components/Pinned'
import { stack } from '@/content/site'

const GROUPS = [
  { key: 'languages', label: 'Languages' },
  { key: 'frameworks', label: 'Frameworks' },
  { key: 'infra', label: 'Infrastructure' },
  { key: 'data', label: 'Data' },
  { key: 'observability', label: 'Observability' },
  { key: 'cloud', label: 'Cloud' },
] as const satisfies readonly { key: keyof typeof stack; label: string }[]

/**
 * Stack.
 *
 * Grouped rather than a flat cloud, because the grouping is itself information:
 * it shows the shape of the work. No proficiency bars — self-assigned
 * percentages are unfalsifiable and read as padding.
 */
export function Stack() {
  return (
    <Section
      id="stack"
      index="03"
      title="I automate everything"
      subtitle="if I have to do it twice by hand, that's a bug"
      accent="#2ed573"
      stock="paper-300"
    >
      <Pinned
        aside={
          <div>
            <p className="max-w-xs leading-relaxed text-muted-foreground">
              Backend and platform is where I&apos;m strongest. I hold my own on the frontend
              — this site is React, Tailwind and Motion with no template underneath it.
            </p>
            <p className="font-pixel mt-6 text-[0.6rem] tracking-[0.25em] uppercase text-[var(--section-accent)]">
              No proficiency bars
            </p>
            <p className="font-mono mt-2 max-w-xs text-xs text-muted-foreground">
              Self-assigned percentages aren&apos;t falsifiable, so they aren&apos;t here.
            </p>
          </div>
        }
      >
        <div className="grid gap-px border-2 border-black bg-black shadow-lg sm:grid-cols-2">
          {GROUPS.map((group, i) => (
            <Reveal key={group.key} delay={i * 0.04} className="bg-card">
              <div className="h-full p-5 md:p-6">
                <h3 className="font-pixel text-[0.65rem] tracking-widest text-[var(--section-accent)] uppercase">
                  {group.label}
                </h3>
                <ul className="mt-4 space-y-1.5">
                  {stack[group.key].map((item) => (
                    <li key={item} className="font-mono text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Pinned>
    </Section>
  )
}
