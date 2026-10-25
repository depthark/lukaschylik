import { component$ } from '@qwik.dev/core'
import { useDocumentHead, useLocation } from '@qwik.dev/router'
import { SITE_OWNER, SITE_URL } from '~/constants/site'
import { getLocaleFromPathname, localizePath, stripLocale } from '~/i18n'
import ui from '~/i18n/ui.json'
import { buildStructuredData } from '~/utils/structured-data'

/**
 * Makes a site-relative URL absolute against the production origin.
 * @param url - Absolute or site-relative URL
 */
const toAbsolute = (url?: string) =>
  !url ? undefined : /^https?:\/\//i.test(url) ? url : `${SITE_URL}${url}`

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
  const canonicalUrl = `${SITE_URL}${loc.url.pathname}`
  const skUrl = `${SITE_URL}${localizePath(basePath, 'sk')}`
  const enUrl = `${SITE_URL}${localizePath(basePath, 'en')}`

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
  const defaultOpenGraphImage = `${SITE_URL}/images/meta/meta-large.webp`
  const defaultTwitterImage = defaultOpenGraphImage

  // Resolve route-provided images (og/twitter) if any
  const findMeta = (nameOrProp: string) =>
    head.meta.find(
      (m) => m.name === nameOrProp || (m as any).property === nameOrProp,
    )

  const routeOgImage =
    findMeta('og:image')?.content || findMeta('image')?.content
  const routeTwitterImage = findMeta('twitter:image')?.content

  const ogImage = toAbsolute(routeOgImage) || defaultOpenGraphImage
  const twitterImage =
    toAbsolute(routeTwitterImage) ||
    toAbsolute(routeOgImage) ||
    defaultTwitterImage

  const hasOgImage = !!findMeta('og:image')
  const hasTwitterImage = !!findMeta('twitter:image')
  const hasTwitterCard = !!head.meta.find((m) => m.name === 'twitter:card')
  const hasOgType = !!findMeta('og:type')
  const routeRobots = findMeta('robots')?.content
  const indexable = !routeRobots?.includes('noindex')
  const webMcpOriginTrial: string | undefined = import.meta.env
    .PUBLIC_WEBMCP_ORIGIN_TRIAL

  return (
    <>
      <title>{title}</title>

      {indexable && (
        <>
          <link rel="canonical" href={canonicalUrl} />
          <link rel="alternate" hreflang="sk" href={skUrl} />
          <link rel="alternate" hreflang="en" href={enUrl} />
          <link rel="alternate" hreflang="x-default" href={skUrl} />
        </>
      )}
      {webMcpOriginTrial && (
        <meta http-equiv="origin-trial" content={webMcpOriginTrial} />
      )}
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
      <link
        rel="alternate"
        type="text/markdown"
        title="llms.txt"
        href="/llms.txt"
      />
      <link
        rel="alternate"
        type="application/json"
        title="Agent data"
        href="/agent/site.json"
      />

      <meta name="description" content={description} />
      <meta http-equiv="Accept-CH" content="DPR, Viewport-Width, Width" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta http-equiv="Content-Language" content={locale} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#000"></meta>
      {!routeRobots && (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1"
        />
      )}
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
      <meta property="og:site_name" content={SITE_OWNER} />
      <meta property="og:url" content={canonicalUrl} />
      {!hasOgImage && (
        <>
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={t.ogImageAlt} />
        </>
      )}
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
      {!hasTwitterCard && (
        <meta name="twitter:card" content="summary_large_image" />
      )}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {!hasTwitterImage && <meta name="twitter:image" content={twitterImage} />}
      {!hasTwitterImage && (
        <meta name="twitter:image:alt" content={t.ogImageAlt} />
      )}

      {/* Dynamic meta tags from routes (only those not handled above) */}
      {head.meta
        .filter((m) => m.name !== 'description')
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

      {indexable && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={buildStructuredData({
            url: canonicalUrl,
            locale,
            title,
            description,
          })}
        />
      )}

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
