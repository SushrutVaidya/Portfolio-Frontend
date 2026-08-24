import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Self-hosted fonts (via @fontsource), NOT a Google Fonts <link>: a render-
// blocking third-party request on first paint is both a perf and a privacy
// cost, and the guidelines call it out. Newsreader carries the display serif
// incl. its italic (used for inline emphasis); Inter the body; JetBrains Mono
// every readout. All variable, so one axis file covers every weight.
import '@fontsource-variable/newsreader'
import '@fontsource-variable/newsreader/standard-italic.css'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics.ts'

// Injected from bundled JS rather than an inline <script>, which is what lets
// the CSP drop 'unsafe-inline' from script-src. No-ops in dev and under DNT.
initAnalytics()

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
