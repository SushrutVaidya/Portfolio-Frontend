import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { isLoglensHost, MAIN_SITE } from '@/lib/host'

/**
 * A link that stays in-app on the main site but jumps back to the apex domain
 * when the app is served from the loglens.* subdomain, where the home page and
 * case studies don't exist as local routes. Keeps "Back to work" and the case
 * study link working from the standalone loglens host without a broken hop.
 */
export function SiteLink({
  to,
  className,
  children,
}: {
  to: string
  className?: string
  children: ReactNode
}) {
  if (isLoglensHost) {
    return (
      <a href={`${MAIN_SITE}${to}`} className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}
