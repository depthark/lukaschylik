import { useLocation } from '@qwik.dev/router'
import { getLocaleFromPathname, type Locale } from './core'

export * from './core'

/**
 * Hook returning the active locale derived from the current URL.
 * Must be called inside a Qwik component.
 */
export const useLocale = (): Locale =>
  getLocaleFromPathname(useLocation().url.pathname)
