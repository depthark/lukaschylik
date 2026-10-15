import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sessionsI18n from '../src/components/sessions/sessions.i18n.json'
import manifest from '../src/generated/posts-manifest.json'
import {
  CONSULTING_HOURLY_RATE_CZK,
  CONTACT_EMAIL,
} from '../src/constants/business'
import { REFERENCES } from '../src/constants/references'
import { SESSION_VIDEO_SOURCES } from '../src/constants/sessions'
import { SOCIAL_LINKS } from '../src/constants/socialLinks'
import { type Locale, localizePath } from '../src/i18n/core'
import footerI18n from '../src/sections/footer/footer.i18n.json'
import servicesI18n from '../src/sections/services/services.i18n.json'

const SITE_URL = 'https://lukaschylik.dev'

const SOCIAL_NETWORK_NAMES: Record<
  (typeof SOCIAL_LINKS)[number]['icon'],
  string
> = {
  linkedin: 'LinkedIn',
  discord: 'Discord (CSS CzechoSlovakia)',
  codepen: 'CodePen',
  github: 'GitHub',
}

/**
 * Builds an absolute URL for a site path in the given locale.
 * @param path - sk-relative site path
 * @param locale - Target locale
 */
const siteUrl = (path: string, locale: Locale): string =>
  `${SITE_URL}${localizePath(path, locale)}`

/**
 * Renders the blog post list of one locale as Markdown links.
 * @param locale - Content locale
 */
const renderPosts = (locale: Locale): string[] =>
  manifest[locale].map(
    (post) =>
      `- [${post.title}](${siteUrl(`/blog/articles/${post.slug}/`, locale)}): ${post.description}`,
  )

/**
 * Renders recorded talks as Markdown links to YouTube.
 */
const renderSessions = (): string[] =>
  SESSION_VIDEO_SOURCES.map((source, index) => {
    const id = new URL(source).pathname.split('/').pop()
    return `- [${sessionsI18n.en.videos[index]}](https://www.youtube.com/watch?v=${id})`
  })

/**
 * Joins service feature items into one line.
 * @param items - Service feature list entries
 */
const describe = (items: { text: string }[]): string =>
  items.map((item) => item.text).join('; ')

/**
 * Renders the offered services with pricing.
 */
const renderServices = (): string[] => {
  const { cards } = servicesI18n.en
  return [
    `- **${cards.consulting.title}** (${CONSULTING_HOURLY_RATE_CZK} CZK per hour, bookable online as a 60-minute session): ${describe(cards.consulting.items)}`,
    `- **${cards.workshops.title}** (${cards.workshops.priceLabel}): ${describe(cards.workshops.items)}`,
    `- **${cards.speaking.title}** (${cards.speaking.priceLabel}): ${describe(cards.speaking.items)}`,
  ]
}

/**
 * Generates `dist/llms.txt` following https://llmstxt.org/ so language models
 * get a concise, link-rich overview of the site.
 */
const generateLlmsTxt = (): void => {
  const footer = footerI18n.en
  const lines = [
    `# ${footer.address.name}`,
    '',
    `> ${footer.tagline} Based in Brno, Czech Republic. The site is in Slovak (default, unprefixed URLs) with an English version under \`/en/\`.`,
    '',
    'Portfolio, services, recorded talks and a blog about modern CSS, frontend, design systems and AI-assisted development.',
    '',
    '## Pages',
    '',
    `- [Home](${siteUrl('/', 'en')}): about, references, services and contact form ([Slovak](${siteUrl('/', 'sk')}))`,
    `- [Sessions](${siteUrl('/sessions/', 'en')}): recordings of conference and meetup talks`,
    `- [Blog](${siteUrl('/blog/', 'en')}): articles ([Slovak](${siteUrl('/blog/', 'sk')}))`,
    `- [Privacy policy](${siteUrl('/gdpr/', 'en')})`,
    '',
    '## Services',
    '',
    ...renderServices(),
    '',
    '## Contact',
    '',
    `- [Email](mailto:${CONTACT_EMAIL})`,
    `- [Contact form](${siteUrl('/#contact', 'en')})`,
    ...SOCIAL_LINKS.map(
      (link) => `- [${SOCIAL_NETWORK_NAMES[link.icon]}](${link.href})`,
    ),
    '',
    '## Blog (English)',
    '',
    ...renderPosts('en'),
    '',
    '## Blog (Slovak)',
    '',
    ...renderPosts('sk'),
    '',
    '## Talks',
    '',
    ...renderSessions(),
    '',
    '## References',
    '',
    ...REFERENCES.map(
      (reference) => `- [${reference.title}](${reference.webURL})`,
    ),
    '',
    '## AI agents',
    '',
    'Every page registers [WebMCP](https://webmachinelearning.github.io/webmcp/) tools in supporting browsers: `get_page_context`, `get_profile`, `list_services`, `list_references`, `list_sessions`, `search_blog_posts`, `get_blog_post`, `navigate`, `open_blog_post`, `set_theme`, `set_language`, `open_booking`, `send_contact_message` and `subscribe_newsletter`. The contact and newsletter forms are also annotated as declarative WebMCP tools.',
    '',
    '## Optional',
    '',
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    '',
  ]

  writeFileSync(
    join(process.cwd(), 'dist', 'llms.txt'),
    lines.join('\n'),
    'utf-8',
  )
  console.log('✓ Generated llms.txt')
}

generateLlmsTxt()
