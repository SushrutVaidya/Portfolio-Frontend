import { useEffect, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'
import { useLocation } from 'react-router-dom'

/**
 * Smooth scroll.
 *
 * This is the single biggest reason the reference sites feel different from a
 * default React app — native scroll is the tell. Lenis interpolates toward the
 * target scroll position, which also makes scroll-linked animation read as one
 * continuous motion rather than a series of discrete jumps.
 *
 * Lenis drives real window scroll rather than transforming a container, so
 * IntersectionObserver, Motion's useScroll and anchor links all keep working.
 *
 * Disabled entirely under prefers-reduced-motion: hijacking scroll is exactly
 * what that setting is asking us not to do.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.1,
      // Matches --ease-expo-out so scroll settles like everything else.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Let touch devices use their native momentum; emulating it feels worse.
      syncTouch: false,
    })
    lenisRef.current = lenis

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    // Delegate in-page anchors to Lenis so they ease instead of teleporting.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]')
      if (!anchor) return
      const id = anchor.getAttribute('href')!.slice(1)
      const target = document.getElementById(id)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target, { offset: 0 })
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Route changes must reset scroll — Lenis holds its own position, so the
  // browser's default restoration doesn't apply.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
  }, [pathname])

  return <>{children}</>
}
