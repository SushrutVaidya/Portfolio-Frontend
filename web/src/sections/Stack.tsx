import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
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
      <div className="grid gap-px border-2 border-black bg-black shadow-lg sm:grid-cols-2 lg:grid-cols-3">
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
    </Section>
  )
}
