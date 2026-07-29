import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

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
