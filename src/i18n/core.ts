/**
 * Supported UI locales. Slovak is the default and lives at the URL root,
 * English is served under the `/en` path prefix.
 */
export type Locale = 'sk' | 'en'

/**
 * Default locale served at unprefixed URLs.
 */
export const DEFAULT_LOCALE: Locale = 'sk'

/**
 * Resolves the locale from a URL pathname (`/en/...` → en, everything else → sk).
 * @param pathname - URL pathname to inspect
 */
export const getLocaleFromPathname = (pathname: string): Locale =>
  pathname === '/en' || pathname.startsWith('/en/') ? 'en' : DEFAULT_LOCALE

/**
 * Removes the locale prefix from a pathname, returning the sk-relative path.
 * @param pathname - URL pathname that may carry an `/en` prefix
 */
export const stripLocale = (pathname: string): string => {
  if (pathname === '/en' || pathname === '/en/') {
    return '/'
  }

  if (pathname.startsWith('/en/')) {
    return pathname.slice(3)
  }

  return pathname
}

/**
 * Localizes an internal path (which may include a hash) for the given locale.
 * @param path - Internal path such as `/blog/` or `/#contact`
 * @param locale - Target locale
 */
export const localizePath = (path: string, locale: Locale): string => {
  const base = stripLocale(path)

  if (locale === DEFAULT_LOCALE) {
    return base
  }

  return base === '/' ? '/en/' : `/en${base}`
}
