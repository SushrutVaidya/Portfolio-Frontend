import { Intro, Statement } from '@/sections/Intro'
import { Work } from '@/sections/Work'
import { Ledger } from '@/sections/Ledger'
import { Contact } from '@/sections/Contact'

/**
 * Home.
 *
 * Six numbered frames, one idea each. The previous composition had nine sections
 * plus two marquees, all inside centred columns - which is why no single thing
 * read as important. Work now occupies four consecutive full-height frames and is
 * unmistakably the centre of the page.
 */
export function Home({ ready }: { ready: boolean }) {
  return (
    <>
      <Intro ready={ready} />
      <Statement />
      <Work />
      <Ledger />
      <Contact />
    </>
  )
}
