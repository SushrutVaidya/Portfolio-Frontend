import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
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
