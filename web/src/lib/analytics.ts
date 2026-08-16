/**
 * Google Analytics, loaded as a module rather than an inline snippet.
 *
 * The old site had gtag inline in index.html, which is what forced
 * `'unsafe-inline'` into the CSP script-src. Injecting the tag from bundled JS
 * means the only CSP allowance needed is the googletagmanager origin, so the
 * inline-script hole can close.
 *
 * No-ops in dev, and honours Do Not Track — a portfolio has no business
 * ignoring it.
 */

const GA_ID = 'G-8PN208RE6Q'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function initAnalytics(): void {
  if (import.meta.env.DEV) return
  if (navigator.doNotTrack === '1') return
  if (document.querySelector(`script[data-ga="${GA_ID}"]`)) return

  const tag = document.createElement('script')
  tag.async = true
  tag.dataset.ga = GA_ID
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(tag)

  window.dataLayer = window.dataLayer || []
  // Must be a real `arguments`-forwarding function, not a rest-arg arrow:
  // gtag.js reads the arguments object off the queued entries.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)
}

/** SPA route change. gtag only auto-sends the first page_view. */
export function trackPageView(path: string): void {
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
  })
}
