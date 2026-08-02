import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { localizePath } from '../src/i18n/core'
import { getAllPosts } from '../src/utils/markdown.server'

const SITE_URL = 'https://lukaschylik.dev'

interface SitemapUrl {
  loc: string
  lastmod: string
  priority: string
  /** sk-relative path used to derive hreflang alternates */
  basePath: string
}

const toIsoDate = (value: string): string => {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString()
  }

  return parsedDate.toISOString()
}

const escapeXml = (value: string): string => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

const createUrlEntry = ({
  loc,
  lastmod,
  priority,
  basePath,
}: SitemapUrl): string => {
  const skUrl = `${SITE_URL}${localizePath(basePath, 'sk')}`
  const enUrl = `${SITE_URL}${localizePath(basePath, 'en')}`

  return [
    '<url>',
    `  <loc>${escapeXml(loc)}</loc>`,
    `  <lastmod>${escapeXml(lastmod)}</lastmod>`,
    `  <priority>${escapeXml(priority)}</priority>`,
    `  <xhtml:link rel="alternate" hreflang="sk" href="${escapeXml(skUrl)}"/>`,
    `  <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enUrl)}"/>`,
    `  <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(skUrl)}"/>`,
    '</url>',
  ].join('\n')
}

const generateSitemap = (): void => {
  const skPosts = getAllPosts('sk')
  const enPosts = getAllPosts('en')
  const generatedAt = new Date().toISOString()

  const pages: Omit<SitemapUrl, 'loc'>[] = [
    { basePath: '/', lastmod: generatedAt, priority: '1.00' },
    { basePath: '/blog/', lastmod: generatedAt, priority: '0.80' },
    { basePath: '/sessions/', lastmod: generatedAt, priority: '0.80' },
    { basePath: '/gdpr/', lastmod: generatedAt, priority: '0.50' },
    ...skPosts.map((post) => ({
      basePath: `/blog/articles/${post.slug}/`,
      lastmod: toIsoDate(post.date),
      priority: '0.70',
    })),
  ]

  const enSlugs = new Set(enPosts.map((post) => post.slug))
  const urls: SitemapUrl[] = pages.flatMap((page) => {
    const isArticle = page.basePath.startsWith('/blog/articles/')
    const slug = isArticle ? page.basePath.split('/')[3] : null
    const hasEnVariant = !isArticle || (slug !== null && enSlugs.has(slug))

    const entries: SitemapUrl[] = [
      { ...page, loc: `${SITE_URL}${localizePath(page.basePath, 'sk')}` },
    ]

    if (hasEnVariant) {
      entries.push({
        ...page,
        loc: `${SITE_URL}${localizePath(page.basePath, 'en')}`,
      })
    }

    return entries
  })

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((url) => createUrlEntry(url)).join('\n')}
</urlset>`

  const distPath = join(process.cwd(), 'dist', 'sitemap.xml')
  writeFileSync(distPath, xmlBody, 'utf-8')

  console.log(`✓ Generated sitemap.xml with ${urls.length} URLs`)
}

generateSitemap()
