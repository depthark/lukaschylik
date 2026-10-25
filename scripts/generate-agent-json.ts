import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { SITE_URL } from '../src/constants/site'
import type { Locale } from '../src/i18n/core'
import ui from '../src/i18n/ui.json'
import { createWebMcpTools } from '../src/webmcp/tools'
import {
  getProfile,
  getReferences,
  getServices,
  getSessions,
  searchPosts,
  toAbsoluteUrl,
} from '../src/webmcp/site-data'

const LOCALES: Locale[] = ['sk', 'en']

/**
 * Builds the per-locale content block of the agent data file.
 * @param locale - Content locale
 */
const localeContent = (locale: Locale) => ({
  description: ui[locale].siteMeta.defaultDescription,
  home: toAbsoluteUrl(locale === 'sk' ? '/' : '/en/'),
  services: getServices(locale),
  references: getReferences(locale),
  sessions: getSessions(locale),
  blogPosts: searchPosts(locale, '', 1000),
})

/**
 * Lists the imperative WebMCP tools with their descriptions. Actions are
 * stubbed because only the tool metadata is serialized.
 */
const toolCatalog = () =>
  createWebMcpTools({
    navigate: () => undefined,
    openBooking: () => undefined,
    showAlert: () => undefined,
  }).map(({ name, description, annotations }) => ({
    name,
    description,
    readOnly: Boolean(annotations?.readOnlyHint),
  }))

/**
 * Generates `dist/agent/site.json`, a machine-readable profile of the site for
 * AI agents, from the same data the WebMCP tools serve at runtime.
 */
const generateAgentJson = (): void => {
  const data = {
    name: getProfile('en').name,
    url: `${SITE_URL}/`,
    defaultLanguage: 'sk',
    languages: LOCALES,
    generatedAt: new Date().toISOString(),
    profile: getProfile('en'),
    content: Object.fromEntries(
      LOCALES.map((locale) => [locale, localeContent(locale)]),
    ),
    agentAccess: {
      llmsTxt: `${SITE_URL}/llms.txt`,
      sitemap: `${SITE_URL}/sitemap.xml`,
      structuredData:
        'Every indexable page embeds a schema.org JSON-LD @graph (Person, WebSite, page type, BreadcrumbList, BlogPosting).',
      webmcp: {
        spec: 'https://webmachinelearning.github.io/webmcp/',
        imperativeTools: toolCatalog(),
        declarativeForms: [
          { toolname: 'contact_form', page: `${SITE_URL}/#contact` },
          { toolname: 'newsletter_signup', page: `${SITE_URL}/blog/` },
        ],
      },
      policy:
        'Agents may read all content and prefill forms. The visitor must review and confirm every message or subscription before it is sent.',
    },
  }

  const dir = join(process.cwd(), 'dist', 'agent')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'site.json'), `${JSON.stringify(data, null, 2)}\n`)
  console.log('✓ Generated agent/site.json')
}

generateAgentJson()
