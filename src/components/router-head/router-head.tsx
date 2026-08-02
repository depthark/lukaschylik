import { component$ } from '@qwik.dev/core'
import { useDocumentHead, useLocation } from '@qwik.dev/router'
import { getLocaleFromPathname, localizePath, stripLocale } from '~/i18n'
import ui from '~/i18n/ui.json'

/**
 * RouterHead component for managing document head metadata
 * Handles default values and dynamic meta tags for SEO optimization
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead()
  const loc = useLocation()

  const locale = getLocaleFromPathname(loc.url.pathname)
  const t = ui[locale].siteMeta
  const basePath = stripLocale(loc.url.pathname)
  const skUrl = new URL(localizePath(basePath, 'sk'), loc.url.origin).href
  const enUrl = new URL(localizePath(basePath, 'en'), loc.url.origin).href

  const defaultTitle = t.defaultTitle
  const defaultDescription = t.defaultDescription

  // Custom override mechanism - handle title and description from routes
  const title = head.title || defaultTitle

  // For description: look in meta array, then use default
  const descriptionFromMeta = head.meta.find(
    (m) => m.name === 'description',
  )?.content
  const description = descriptionFromMeta || defaultDescription

  // Default meta images (not overridable)
  const defaultOpenGraphImage = '/images/meta/meta-large.webp'
  const defaultTwitterImage = '/images/meta/meta-small.webp'

  // Resolve route-provided images (og/twitter) if any
  const findMeta = (nameOrProp: string) =>
    head.meta.find(
      (m) => m.name === nameOrProp || (m as any).property === nameOrProp,
    )

  const routeOgImage =
    findMeta('og:image')?.content || findMeta('image')?.content
  const routeTwitterImage = findMeta('twitter:image')?.content

  const toAbsolute = (url?: string) =>
    !url
      ? undefined
      : /^https?:\/\//i.test(url)
        ? url
        : new URL(url, loc.url.origin).href

  const ogImage = toAbsolute(routeOgImage) || defaultOpenGraphImage
  const twitterImage =
    toAbsolute(routeTwitterImage) ||
    toAbsolute(routeOgImage) ||
    defaultTwitterImage

  const hasOgImage = !!findMeta('og:image')
  const hasTwitterImage = !!findMeta('twitter:image')
  const hasTwitterCard = !!head.meta.find((m) => m.name === 'twitter:card')
  const hasOgType = !!findMeta('og:type')

  return (
    <>
      <title>{title}</title>

      <link rel="canonical" href={loc.url.href} />
      <link rel="alternate" hreflang="sk" href={skUrl} />
      <link rel="alternate" hreflang="en" href={enUrl} />
      <link rel="alternate" hreflang="x-default" href={skUrl} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=3, viewport-fit=cover"
      />
      <link
        rel="icon"
        type="image/png"
        href="/images/favicon/favicon-96x96.png"
        sizes="96x96"
      />
      <link
        rel="icon"
        type="image/svg+xml"
        href="/images/favicon/favicon.svg"
      />
      <link rel="shortcut icon" href="/images/favicon/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/images/favicon/apple-touch-icon.png"
      />
      <meta name="apple-mobile-web-app-title" content="Lukáš Chylík" />
      <link rel="manifest" href="/manifest.json" />

      <meta name="description" content={description} />
      <meta http-equiv="Accept-CH" content="DPR, Viewport-Width, Width" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta http-equiv="Content-Language" content={locale} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#000"></meta>
      <meta name="robots" content="index, follow" />
      <meta name="keywords" content={t.keywords} />
      <meta name="author" content="Lukáš Chylík" />
      <meta name="publisher" content="Lukáš Chylík" />

      {/* Schema.org markup */}
      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <meta itemProp="image" content={ogImage} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={loc.url.href} />
      {!hasOgImage && <meta property="og:image" content={ogImage} />}
      {!hasOgType && <meta property="og:type" content="website" />}
      <meta
        property="og:locale"
        content={locale === 'sk' ? 'sk_SK' : 'en_US'}
      />
      <meta
        property="og:locale:alternate"
        content={locale === 'sk' ? 'en_US' : 'sk_SK'}
      />

      {/* Twitter Card meta tags */}
      {!hasTwitterCard && <meta name="twitter:card" content="summary" />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {!hasTwitterImage && <meta name="twitter:image" content={twitterImage} />}

      {/* Dynamic meta tags from routes (only those not handled above) */}
      {head.meta
        .filter((m) => m.name !== 'description') // Skip description as it's handled conditionally above
        .map((m) => (
          <meta key={m.key} {...m} />
        ))}

      {/* Dynamic links from routes */}
      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {/* Dynamic styles from routes */}
      {head.styles.map((s) => (
        <style
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.style })}
        />
      ))}

      {/* Dynamic scripts from routes */}
      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
    </>
  )
})
