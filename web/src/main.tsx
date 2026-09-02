import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Self-hosted fonts (via @fontsource), NOT a Google Fonts <link>. Bricolage
// Grotesque carries the chunky playful display; Inter the body; JetBrains Mono
// the readouts. All variable, so one axis file covers every weight.
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics.ts'
import { initAnimatedFavicon } from './lib/animatedFavicon.ts'

// Injected from bundled JS rather than an inline <script>, which is what lets
// the CSP drop 'unsafe-inline' from script-src. No-ops in dev and under DNT.
initAnalytics()

// Animated tab icon — sprinting "SV" figure on the portfolio, a scanning log
// line on loglens. Reduced-motion safe, pauses when the tab is hidden.
initAnimatedFavicon()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BrowserRouter, not HashRouter: nginx already serves the SPA fallback
        (`try_files $uri $uri/ /index.html`), so real paths like /work/devquest
        resolve on hard refresh. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
