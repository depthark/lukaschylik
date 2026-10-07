import { getLocaleFromPathname, type Locale, localizePath } from '~/i18n/core'
import alertI18n from '~/services/alert.i18n.json'
import { sendContactMessage } from '~/services/contact.service'
import { subscribeToNewsletter } from '~/services/newsletter.service'
import { findPost } from '~/utils/posts'
import {
  applyTheme,
  getDocumentTheme,
  storeTheme,
  type Theme,
} from '~/utils/theme'
import { fail, type ModelContextTool, ok } from './model-context'
import {
  DESTINATIONS,
  type Destination,
  getPostPath,
  getPostWithContent,
  getProfile,
  getReferences,
  getServices,
  getSessions,
  getSiteTitle,
  searchPosts,
  toAbsoluteUrl,
} from './site-data'
import i18n from './webmcp.i18n.json'

/**
 * Site actions the tools delegate to, provided by the root layout.
 */
export interface WebMcpActions {
  /** Client-side navigation to a site-relative path */
  navigate: (path: string) => Promise<unknown> | unknown
  /** Opens the Cal.com booking dialog */
  openBooking: () => Promise<unknown> | unknown
  /** Shows a global alert to the visitor */
  showAlert: (message: string) => Promise<unknown> | unknown
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const READ_ONLY = { readOnlyHint: true }

/**
 * Resolves the locale of the page the visitor is currently on.
 */
const currentLocale = (): Locale =>
  getLocaleFromPathname(window.location.pathname)

/**
 * Resolves content locale from an optional tool argument, defaulting to the
 * page locale.
 * @param value - Raw `language` argument
 */
const resolveLocale = (value: unknown): Locale =>
  value === 'sk' || value === 'en' ? value : currentLocale()

/**
 * Reads a trimmed string argument.
 * @param input - Tool input
 * @param key - Argument name
 */
const readString = (input: Record<string, unknown>, key: string): string => {
  const value = input[key]
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Replaces `{key}` placeholders in a template.
 * @param template - Text with placeholders
 * @param values - Placeholder values
 */
const format = (template: string, values: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')

/**
 * Scrolls to the element referenced by a URL hash, if it exists.
 * @param path - Site-relative path that may include a hash
 */
const scrollToHash = (path: string) => {
  const id = path.split('#')[1]
  if (id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
}

const languageProperty = {
  type: 'string',
  enum: ['sk', 'en'],
  description:
    'Content language: "sk" (Slovak) or "en" (English). Defaults to the language of the current page.',
}

/**
 * Read-only tools exposing the site's content.
 */
const createContentTools = (): ModelContextTool[] => [
  {
    name: 'get_page_context',
    title: 'Current page',
    description:
      'Describe the page the visitor is currently viewing on lukaschylik.dev: URL, language, title, color theme and the list of destinations accepted by the navigate tool. Call this first to orient yourself.',
    inputSchema: { type: 'object', properties: {} },
    annotations: READ_ONLY,
    execute: async () => {
      const locale = currentLocale()
      return ok({
        site: getSiteTitle(locale),
        url: window.location.href,
        title: document.title,
        language: locale,
        theme: getDocumentTheme(document) ?? 'light',
        destinations: Object.keys(DESTINATIONS),
      })
    },
  },
  {
    name: 'get_profile',
    title: 'About Lukáš Chylík',
    description:
      'Get public information about Lukáš Chylík, the owner of this portfolio: frontend developer with UX/UI overlap focused on design systems and AI in development. Returns bio, location, email, phone, company ID and social profiles.',
    inputSchema: {
      type: 'object',
      properties: { language: languageProperty },
    },
    annotations: READ_ONLY,
    execute: async (input) => ok(getProfile(resolveLocale(input.language))),
  },
  {
    name: 'list_services',
    title: 'Services and pricing',
    description:
      'List the services Lukáš offers (consulting & mentoring, AI workshops & training, conference speaking) with descriptions, pricing and how to order each one.',
    inputSchema: {
      type: 'object',
      properties: { language: languageProperty },
    },
    annotations: READ_ONLY,
    execute: async (input) => ok(getServices(resolveLocale(input.language))),
  },
  {
    name: 'list_references',
    title: 'Client references',
    description:
      'List selected client projects and collaborations (design systems, collaborations and websites) with links.',
    inputSchema: {
      type: 'object',
      properties: { language: languageProperty },
    },
    annotations: READ_ONLY,
    execute: async (input) => ok(getReferences(resolveLocale(input.language))),
  },
  {
    name: 'list_sessions',
    title: 'Recorded talks',
    description:
      'List recordings of conference and meetup talks given by Lukáš (modern CSS, frontend, Figma, AI workflows) with YouTube links.',
    inputSchema: {
      type: 'object',
      properties: { language: languageProperty },
    },
    annotations: READ_ONLY,
    execute: async (input) => ok(getSessions(resolveLocale(input.language))),
  },
  {
    name: 'search_blog_posts',
    title: 'Search blog',
    description:
      'List or search blog articles (newest first) about CSS, frontend, design systems and AI. Matches all query words against title, subtitle and description. Returns slug, metadata and URL; use get_blog_post with the slug to read the full article.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search words, e.g. "view transitions". Omit to list all articles.',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 50,
          description: 'Maximum number of articles to return. Defaults to 20.',
        },
        language: languageProperty,
      },
    },
    annotations: READ_ONLY,
    execute: async (input) => {
      const limit =
        typeof input.limit === 'number'
          ? Math.min(50, Math.max(1, Math.floor(input.limit)))
          : 20
      const posts = searchPosts(
        resolveLocale(input.language),
        readString(input, 'query'),
        limit,
      )
      return ok(posts.length ? posts : 'No articles match the query.')
    },
  },
  {
    name: 'get_blog_post',
    title: 'Read blog article',
    description:
      'Get the metadata and the full plain-text content of a blog article by its slug (from search_blog_posts). Useful for summarizing or answering questions about an article.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Article slug.' },
        language: languageProperty,
      },
      required: ['slug'],
    },
    annotations: READ_ONLY,
    execute: async (input) => {
      const slug = readString(input, 'slug')
      try {
        const post = await getPostWithContent(
          resolveLocale(input.language),
          slug,
        )
        return post
          ? ok(post)
          : fail(
              `Unknown slug "${slug}". Use search_blog_posts to find valid slugs.`,
            )
      } catch (error) {
        return fail(`Failed to load the article: ${String(error)}`)
      }
    },
  },
]

/**
 * Tools that change what the visitor sees, without leaving the site.
 * @param actions - Site actions provided by the layout
 */
const createUiTools = (actions: WebMcpActions): ModelContextTool[] => [
  {
    name: 'navigate',
    title: 'Go to page',
    description:
      'Navigate the visitor to a page or home page section of the site, keeping the current language.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: {
          type: 'string',
          enum: Object.keys(DESTINATIONS),
          description:
            'home, about, references, services, contact (contact form), sessions (talk recordings), blog (article list) or privacy (privacy policy).',
        },
      },
      required: ['destination'],
    },
    execute: async (input) => {
      const destination = readString(input, 'destination') as Destination
      if (!(destination in DESTINATIONS)) {
        return fail(`Unknown destination "${destination}".`)
      }

      const path = localizePath(DESTINATIONS[destination], currentLocale())
      await actions.navigate(path)
      scrollToHash(path)
      return ok(`Navigated to ${toAbsoluteUrl(path)}`)
    },
  },
  {
    name: 'open_blog_post',
    title: 'Open blog article',
    description:
      'Open a blog article in the current language so the visitor can read it.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Article slug from search_blog_posts.',
        },
      },
      required: ['slug'],
    },
    execute: async (input) => {
      const locale = currentLocale()
      const slug = readString(input, 'slug')
      if (!findPost(locale, slug)) {
        return fail(
          `Unknown slug "${slug}". Use search_blog_posts to find valid slugs.`,
        )
      }

      const path = getPostPath(locale, slug)
      await actions.navigate(path)
      return ok(`Opened ${toAbsoluteUrl(path)}`)
    },
  },
  {
    name: 'set_theme',
    title: 'Switch color theme',
    description:
      'Switch the site between light and dark mode. The choice is remembered.',
    inputSchema: {
      type: 'object',
      properties: {
        theme: { type: 'string', enum: ['light', 'dark'] },
      },
      required: ['theme'],
    },
    execute: async (input) => {
      const theme = readString(input, 'theme')
      if (theme !== 'light' && theme !== 'dark') {
        return fail('Theme must be "light" or "dark".')
      }

      applyTheme(theme as Theme, document)
      storeTheme(theme as Theme, window.localStorage)
      return ok(`Theme set to ${theme}.`)
    },
  },
  {
    name: 'set_language',
    title: 'Switch language',
    description:
      'Reload the current page in another language: "sk" (Slovak) or "en" (English). Tools re-register after the page loads.',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', enum: ['sk', 'en'] },
      },
      required: ['language'],
    },
    execute: async (input) => {
      const language = readString(input, 'language')
      if (language !== 'sk' && language !== 'en') {
        return fail('Language must be "sk" or "en".')
      }
      if (language === currentLocale()) {
        return ok(`The page is already in "${language}".`)
      }

      const { pathname, hash } = window.location
      const target = localizePath(pathname, language) + hash
      setTimeout(() => window.location.assign(target), 100)
      return ok(`Switching to ${toAbsoluteUrl(target)}`)
    },
  },
]

/**
 * Tools that act on the visitor's behalf. Each asks the visitor for explicit
 * confirmation before anything leaves the browser.
 * @param actions - Site actions provided by the layout
 */
const createActionTools = (actions: WebMcpActions): ModelContextTool[] => [
  {
    name: 'open_booking',
    title: 'Book a consultation',
    description:
      'Open the booking calendar for a paid 60-minute consulting session with Lukáš. The visitor picks the date and time themselves in the calendar.',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      await actions.openBooking()
      return ok(
        'The booking calendar is open. Ask the visitor to pick a date and time and complete the booking.',
      )
    },
  },
  {
    name: 'send_contact_message',
    title: 'Send contact message',
    description:
      'Send a message to Lukáš through the site contact form, e.g. a project inquiry, workshop request or speaking invitation. The visitor sees the full message and must confirm before it is sent.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: "Visitor's full name." },
        email: {
          type: 'string',
          format: 'email',
          description: 'Reply-to email.',
        },
        subject: { type: 'string', description: 'Short subject line.' },
        message: { type: 'string', description: 'Message body.' },
      },
      required: ['name', 'email', 'subject', 'message'],
    },
    execute: async (input) => {
      const data = {
        fullname: readString(input, 'name'),
        email: readString(input, 'email'),
        subject: readString(input, 'subject'),
        message: readString(input, 'message'),
      }
      if (Object.values(data).some((value) => !value)) {
        return fail('All of name, email, subject and message are required.')
      }
      if (!EMAIL_PATTERN.test(data.email)) {
        return fail(`"${data.email}" is not a valid email address.`)
      }

      const locale = currentLocale()
      const prompt = format(i18n[locale].confirmContact, {
        ...data,
        name: data.fullname,
      })
      if (!window.confirm(prompt)) {
        return fail('The visitor declined to send the message.')
      }

      try {
        await sendContactMessage(data, locale)
      } catch (error) {
        return fail(`Sending failed: ${String(error)}`)
      }

      await actions.showAlert(alertI18n[locale].formSubmitted)
      return ok('Message sent. Lukáš will reply by email.')
    },
  },
  {
    name: 'subscribe_newsletter',
    title: 'Subscribe to newsletter',
    description:
      'Subscribe an email address to the newsletter about new articles. The visitor must confirm before subscribing.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Subscriber email.',
        },
      },
      required: ['email'],
    },
    execute: async (input) => {
      const email = readString(input, 'email')
      if (!EMAIL_PATTERN.test(email)) {
        return fail(`"${email}" is not a valid email address.`)
      }

      const locale = currentLocale()
      if (!window.confirm(format(i18n[locale].confirmNewsletter, { email }))) {
        return fail('The visitor declined the subscription.')
      }

      try {
        await subscribeToNewsletter(email)
      } catch (error) {
        return fail(`Subscription failed: ${String(error)}`)
      }

      await actions.showAlert(alertI18n[locale].newsletterSubscribed)
      return ok('Subscribed. A confirmation email may follow.')
    },
  },
]

/**
 * Creates every WebMCP tool the site exposes to in-browser AI agents.
 * @param actions - Site actions provided by the layout
 */
export const createWebMcpTools = (
  actions: WebMcpActions,
): ModelContextTool[] => [
  ...createContentTools(),
  ...createUiTools(actions),
  ...createActionTools(actions),
]
