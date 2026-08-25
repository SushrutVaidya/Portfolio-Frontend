/**
 * Which host is this bundle being served from?
 *
 * The same build is served both from the apex (sushrutvaidya.in, the full
 * portfolio) and from loglens.sushrutvaidya.in, a standalone subdomain that
 * exists only to present the loglens product page at its own clean root. There
 * is one deploy and one nginx frontend container behind both hostnames; the
 * only thing that differs is which page the SPA shows at "/", decided here from
 * the browser hostname rather than the URL path (the path stays "/" so the
 * clean subdomain URL is preserved).
 */

/** True when served from loglens.* — the standalone product subdomain. */
export const isLoglensHost =
  typeof window !== 'undefined' && /^loglens\./i.test(window.location.hostname)

/** Apex origin, used to point cross-site links back to the main portfolio. */
export const MAIN_SITE = 'https://sushrutvaidya.in'
