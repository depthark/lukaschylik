import { CONTACT_EMAIL, CONTACT_PHONE } from '~/constants/business'
import { SITE_OWNER, SITE_URL } from '~/constants/site'
import { SOCIAL_LINKS } from '~/constants/socialLinks'
import { type Locale, localizePath, stripLocale } from '~/i18n/core'
import ui from '~/i18n/ui.json'
import { findPost, getPosts } from './posts'
import type { PostMeta } from './posts.types'

/**
 * Inputs describing the page a JSON-LD graph is built for.
 */
interface PageContext {
  /** Canonical absolute URL of the page */
  url: string
  /** Page locale */
  locale: Locale
  /** Document title */
  title: string
  /** Meta description */
  description: string
}

/**
 * A schema.org node of the `@graph`.
 */
type Node = Record<string, unknown>

const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`

/**
 * Makes a site-relative path absolute.
 * @param path - Path starting with `/`
 */
const absolute = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${SITE_URL}${path}`

/**
 * The site owner, referenced by every page.
 * @param locale - Page locale
 */
const person = (locale: Locale): Node => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: SITE_OWNER,
  url: `${SITE_URL}/`,
  image: absolute('/images/me.webp'),
  jobTitle: 'Creative AI Engineer',
  description: ui[locale].siteMeta.defaultDescription,
  email: `mailto:${CONTACT_EMAIL}`,
  telephone: CONTACT_PHONE,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Hybešova 308/61',
    addressLocality: 'Brno',
    postalCode: '602 00',
    addressCountry: 'CZ',
  },
  knowsAbout: [
    'Frontend development',
    'CSS',
    'Design systems',
    'Accessibility',
    'Technical SEO',
    'AI-assisted software development',
    'UX/UI design',
  ],
  sameAs: SOCIAL_LINKS.filter(({ icon }) => icon !== 'discord').map(
    ({ href }) => href,
  ),
})

/**
 * The website entity, published by the owner.
 * @param locale - Page locale
 */
const website = (locale: Locale): Node => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: SITE_OWNER,
  description: ui[locale].siteMeta.defaultDescription,
  inLanguage: ['sk', 'en'],
  publisher: { '@id': PERSON_ID },
})

/**
 * Breadcrumb trail from the localized home page to the current page.
 * @param ctx - Page context
 * @param trail - Intermediate and final crumbs after the home page
 */
const breadcrumbs = (
  ctx: PageContext,
  trail: { name: string; path: string }[],
): Node => ({
  '@type': 'BreadcrumbList',
  '@id': `${ctx.url}#breadcrumbs`,
  itemListElement: [
    { name: ui[ctx.locale].breadcrumbs.home, path: '/' },
    ...trail,
  ].map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: absolute(localizePath(crumb.path, ctx.locale)),
  })),
})

/**
 * Base WebPage node shared by every page type.
 * @param ctx - Page context
 * @param type - schema.org page type
 * @param extra - Additional properties
 */
const webPage = (ctx: PageContext, type: string, extra: Node = {}): Node => ({
  '@type': type,
  '@id': `${ctx.url}#webpage`,
  url: ctx.url,
  name: ctx.title,
  description: ctx.description,
  inLanguage: ctx.locale,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': PERSON_ID },
  ...extra,
})

/**
 * Article node for a blog post.
 * @param post - Post metadata
 * @param locale - Content locale
 */
const blogPosting = (post: PostMeta, locale: Locale): Node => {
  const url = absolute(localizePath(`/blog/articles/${post.slug}/`, locale))
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    url,
    headline: post.title,
    alternativeHeadline: post.subtitle || undefined,
    description: post.description,
    image: post.cardImg ? [absolute(post.cardImg)] : undefined,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: locale,
    timeRequired: `PT${post.readingTime}M`,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    isPartOf: { '@id': absolute(`${localizePath('/blog/', locale)}#blog`) },
  }
}

/**
 * Page-specific nodes for the current route.
 * @param ctx - Page context
 */
const pageNodes = (ctx: PageContext): Node[] => {
  const path = stripLocale(new URL(ctx.url).pathname)
  const nav = ui[ctx.locale].nav
  const crumbs = ui[ctx.locale].breadcrumbs
  const slug = path.match(/^\/blog\/articles\/([^/]+)\/$/)?.[1]
  const post = slug ? findPost(ctx.locale, slug) : null

  if (post) {
    return [
      webPage(ctx, 'WebPage', {
        mainEntity: { '@id': `${ctx.url}#article` },
        breadcrumb: { '@id': `${ctx.url}#breadcrumbs` },
      }),
      blogPosting(post, ctx.locale),
      breadcrumbs(ctx, [
        { name: nav.blog, path: '/blog/' },
        { name: post.title, path },
      ]),
    ]
  }

  if (path === '/blog/') {
    return [
      webPage(ctx, 'CollectionPage', {
        mainEntity: { '@id': `${ctx.url}#blog` },
        breadcrumb: { '@id': `${ctx.url}#breadcrumbs` },
      }),
      {
        '@type': 'Blog',
        '@id': `${ctx.url}#blog`,
        url: ctx.url,
        name: ctx.title,
        inLanguage: ctx.locale,
        author: { '@id': PERSON_ID },
        publisher: { '@id': PERSON_ID },
        blogPost: getPosts(ctx.locale).map((p) => ({
          '@id': absolute(
            `${localizePath(`/blog/articles/${p.slug}/`, ctx.locale)}#article`,
          ),
        })),
      },
      ...getPosts(ctx.locale).map((p) => blogPosting(p, ctx.locale)),
      breadcrumbs(ctx, [{ name: nav.blog, path }]),
    ]
  }

  const named: Record<string, { type: string; name: string }> = {
    '/sessions/': { type: 'CollectionPage', name: nav.sessions },
    '/gdpr/': { type: 'WebPage', name: crumbs.gdpr },
  }
  const page = named[path]
  if (page) {
    return [
      webPage(ctx, page.type, {
        breadcrumb: { '@id': `${ctx.url}#breadcrumbs` },
      }),
      breadcrumbs(ctx, [{ name: page.name, path }]),
    ]
  }

  return [webPage(ctx, 'ProfilePage', { mainEntity: { '@id': PERSON_ID } })]
}

/**
 * Builds the complete JSON-LD document for a page: owner, website and the
 * page-specific nodes, all linked through absolute `@id` references.
 * @param ctx - Page context
 */
export const buildStructuredData = (ctx: PageContext): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [person(ctx.locale), website(ctx.locale), ...pageNodes(ctx)],
  })
