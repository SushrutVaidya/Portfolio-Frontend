import { HoverMediaProvider } from '@/components/HoverMediaProvider'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Work } from '@/sections/Work'
import { Stack } from '@/sections/Stack'
import { Patent } from '@/sections/Patent'
import { Footer } from '@/sections/Footer'

export default function App() {
  return (
    <HoverMediaProvider>
      {/* Skip link — first focusable element, visible only when focused. The
          hero contains five interactive triggers before the main content, so
          without this a keyboard user has to tab through all of them. */}
      <a
        href="#work"
        className="font-head sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:border-2 focus:border-black focus:bg-primary focus:px-4 focus:py-2"
      >
        Skip to work
      </a>

      <Hero />
      <main>
        <About />
        <Work />
        <Stack />
        <Patent />
      </main>
      <Footer />
    </HoverMediaProvider>
  )
}
