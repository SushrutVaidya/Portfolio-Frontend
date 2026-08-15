import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { ShowcaseScroll } from '@/sections/ShowcaseScroll'
import { Stack } from '@/sections/Stack'
import { Patent } from '@/sections/Patent'

export function Home() {
  return (
    <>
      <Hero />
      <About />
      <ShowcaseScroll />
      <Stack />
      <Patent />
    </>
  )
}
