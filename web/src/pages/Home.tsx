import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { WorkRail } from '@/sections/WorkRail'
import { Stack } from '@/sections/Stack'
import { Patent } from '@/sections/Patent'
import { Marquee } from '@/components/Marquee'

const MARQUEE = [
  'Platform Engineering',
  'Java · Spring Boot',
  'Kubernetes',
  'Apache Airflow',
  'Postgres',
  'Observability',
  'Patented',
] as const

export function Home() {
  return (
    <>
      <Hero />
      {/* Band between hero and content — a hard horizontal rule of moving type,
          which is what stops the page reading as a stack of centred columns. */}
      <Marquee items={MARQUEE} />
      <About />
      <WorkRail />
      <Marquee items={['Open to platform roles', 'Hyderabad · Remote']} duration={22} reverse />
      <Stack />
      <Patent />
    </>
  )
}
