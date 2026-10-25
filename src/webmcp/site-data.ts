import socialI18n from '~/components/social/social.i18n.json'
import sessionsI18n from '~/components/sessions/sessions.i18n.json'
import {
  COMPANY_ID,
  CONSULTING_HOURLY_RATE_CZK,
  CONTACT_EMAIL,
  CONTACT_PHONE,
} from '~/constants/business'
import { REFERENCES } from '~/constants/references'
import { SESSION_VIDEO_SOURCES } from '~/constants/sessions'
import { SITE_URL } from '~/constants/site'
import { SOCIAL_LINKS } from '~/constants/socialLinks'
import { type Locale, localizePath } from '~/i18n/core'
import ui from '~/i18n/ui.json'
import aboutI18n from '~/sections/about/about.i18n.json'
import footerI18n from '~/sections/footer/footer.i18n.json'
import referencesI18n from '~/sections/references/references.i18n.json'
import servicesI18n from '~/sections/services/services.i18n.json'
import { getPosts } from '~/utils/posts'
import type { PostMeta } from '~/utils/posts.types'

/**
 * Rich text segment as stored in section i18n dictionaries.
 */
type Segment = { text: string }

/**
 * Flattens rich text segments into plain text.
 * @param segments - Ordered text segments
 */
const toPlainText = (segments: Segment[]): string =>
  segments.map((segment) => segment.text).join('')

/**
 * Converts a site-relative path into an absolute URL on the current origin,
 * or on the production origin when running outside the browser (build time).
 * @param path - Site-relative path
 */
export const toAbsoluteUrl = (path: string): string =>
  new URL(
    path,
    typeof window === 'undefined' ? SITE_URL : window.location.origin,
  ).toString()

/**
 * Returns public profile and contact information about the site owner.
 * @param locale - Content locale
 */
export const getProfile = (locale: Locale) => {
  const footer = footerI18n[locale]

  return {
    name: footer.address.name,
    headline: footer.tagline,
    about: aboutI18n[locale].paragraphs.map(toPlainText),
    location: `${footer.address.street}, ${footer.address.country}`,
    email: CONTACT_EMAIL,
    phone: CONTACT_PHONE,
    companyId: COMPANY_ID,
    website: toAbsoluteUrl(localizePath('/', locale)),
    social: SOCIAL_LINKS.map((link) => ({
      network: socialI18n[locale].links[link.icon],
      url: link.href,
    })),
    siteLanguages: ['sk', 'en'],
  }
}

/**
 * Returns the offered services with pricing.
 * @param locale - Content locale
 */
export const getServices = (locale: Locale) => {
  const { cards } = servicesI18n[locale]

  return [
    {
      id: 'consulting',
      title: cards.consulting.title,
      price: {
        amount: CONSULTING_HOURLY_RATE_CZK,
        currency: 'CZK',
        unit: 'hour',
      },
      description: toPlainText(cards.consulting.description),
      includes: cards.consulting.items.map((item) => item.text),
      howToOrder: 'Book a 60-minute consultation with the open_booking tool.',
    },
    {
      id: 'workshops',
      title: cards.workshops.title,
      price: cards.workshops.priceLabel,
      description: toPlainText(cards.workshops.description),
      includes: cards.workshops.items.map((item) => item.text),
      howToOrder: 'Ask for a quote with the send_contact_message tool.',
    },
    {
      id: 'speaking',
      title: cards.speaking.title,
      price: cards.speaking.priceLabel,
      description: toPlainText(cards.speaking.description),
      includes: cards.speaking.items.map((item) => item.text),
      howToOrder: 'Send an invitation with the send_contact_message tool.',
    },
  ]
}

/**
 * Returns selected client references.
 * @param locale - Content locale
 */
export const getReferences = (locale: Locale) =>
  REFERENCES.map((reference) => ({
    name: reference.title,
    category: referencesI18n[locale].types[reference.type],
    url: reference.webURL,
  }))

/**
 * Converts a YouTube embed URL into a regular watch URL.
 * @param embedUrl - URL in the `/embed/{id}` form
 */
const toWatchUrl = (embedUrl: string): string => {
  const id = new URL(embedUrl).pathname.split('/').pop()
  return `https://www.youtube.com/watch?v=${id}`
}

/**
 * Returns recorded conference and meetup talks.
 * @param locale - Content locale
 */
export const getSessions = (locale: Locale) =>
  SESSION_VIDEO_SOURCES.map((source, index) => ({
    title: sessionsI18n[locale].videos[index],
    videoUrl: toWatchUrl(source),
  }))

/**
 * Builds the site-relative path of a blog article.
 * @param locale - Content locale
 * @param slug - Article slug
 */
export const getPostPath = (locale: Locale, slug: string): string =>
  localizePath(`/blog/articles/${slug}/`, locale)

/**
 * Serializes post metadata for agents.
 * @param locale - Content locale
 * @param post - Post metadata from the manifest
 */
const toPostSummary = (locale: Locale, post: PostMeta) => ({
  slug: post.slug,
  title: post.title,
  subtitle: post.subtitle,
  description: post.description,
  date: post.date,
  author: post.author,
  readingTimeMinutes: post.readingTime,
  url: toAbsoluteUrl(getPostPath(locale, post.slug)),
  podcastUrl: post.podcastUrl,
})

/**
 * Lists blog posts (newest first), optionally filtered by a full-text query
 * over title, subtitle and description.
 * @param locale - Content locale
 * @param query - Case-insensitive search terms; every term must match
 * @param limit - Maximum number of posts to return
 */
export const searchPosts = (locale: Locale, query = '', limit = 20) => {
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean)

  return getPosts(locale)
    .filter((post) => {
      const haystack =
        `${post.slug} ${post.title} ${post.subtitle} ${post.description}`.toLocaleLowerCase()
      return terms.every((term) => haystack.includes(term))
    })
    .slice(0, limit)
    .map((post) => toPostSummary(locale, post))
}

/**
 * Extracts readable plain text from a rendered blog article, keeping block
 * boundaries as line breaks.
 * @param article - Article element of a rendered blog page
 */
const extractArticleText = (article: Element): string => {
  const clone = article.cloneNode(true) as Element
  clone
    .querySelectorAll('header, script, style, svg, [data-copy-heading]')
    .forEach((node) => node.remove())
  clone
    .querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, pre, blockquote, tr')
    .forEach((node) => node.append('\n'))

  return (clone.textContent ?? '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Loads the rendered article document, reusing the current one when the
 * visitor is already reading that article.
 * @param path - Site-relative article path
 */
const loadArticleDocument = async (path: string): Promise<Document> => {
  if (window.location.pathname === path) {
    return document
  }

  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return new DOMParser().parseFromString(await response.text(), 'text/html')
}

/**
 * Returns a blog post's metadata together with its full text content.
 * @param locale - Content locale
 * @param slug - Article slug
 * @returns The post, or null when no post with that slug exists
 */
export const getPostWithContent = async (locale: Locale, slug: string) => {
  const post = getPosts(locale).find((entry) => entry.slug === slug)
  if (!post) {
    return null
  }

  const articleDocument = await loadArticleDocument(getPostPath(locale, slug))
  const article = articleDocument.querySelector('article')

  return {
    ...toPostSummary(locale, post),
    content: article ? extractArticleText(article) : '',
  }
}

/**
 * Site-relative paths of the pages and home page sections an agent can open.
 */
export const DESTINATIONS = {
  home: '/',
  about: '/#about-me',
  references: '/#references',
  services: '/#services',
  contact: '/#contact',
  sessions: '/sessions/',
  blog: '/blog/',
  privacy: '/gdpr/',
} as const

/**
 * Destination key accepted by the navigation tool.
 */
export type Destination = keyof typeof DESTINATIONS

/**
 * Returns the localized site title used to describe the site to agents.
 * @param locale - Content locale
 */
export const getSiteTitle = (locale: Locale): string =>
  ui[locale].siteMeta.defaultTitle
