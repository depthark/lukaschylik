/**
 * WHAT IS THIS FILE?
 *
 * SSR renderer function, used by Qwik Router.
 *
 * Note that this is the only place the Qwik renderer is called.
 * On the client, containers resume and do not call render.
 */
import { createRenderer } from '@qwik.dev/router'
import { DEFAULT_LOCALE, getLocaleFromPathname } from './i18n/core'
import Root from './root'

/**
 * Resolves the document language from the requested URL (sk default, /en → en).
 */
const resolveLang = (url: unknown): string => {
  if (typeof url !== 'string') {
    return DEFAULT_LOCALE
  }

  try {
    return getLocaleFromPathname(new URL(url).pathname)
  } catch {
    return DEFAULT_LOCALE
  }
}

export default createRenderer((opts) => {
  return {
    jsx: <Root />,
    options: {
      ...opts,
      preloader: { ssrPreloads: 0 },
      containerAttributes: {
        lang: resolveLang(opts.serverData?.url),
        ...opts.containerAttributes,
      },
    },
  }
})
