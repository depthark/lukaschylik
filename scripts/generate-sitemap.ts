import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { getAllPosts } from '../src/utils/markdown.server'

const SITE_URL = 'https://lukaschylik.dev'

interface SitemapUrl {
  loc: string
  lastmod: string
  priority: string
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

const createUrlEntry = ({ loc, lastmod, priority }: SitemapUrl): string => {
  return [
    '<url>',
    `  <loc>${escapeXml(loc)}</loc>`,
    `  <lastmod>${escapeXml(lastmod)}</lastmod>`,
    `  <priority>${escapeXml(priority)}</priority>`,
    '</url>',
  ].join('\n')
}

const generateSitemap = (): void => {
  const posts = getAllPosts()
  const generatedAt = new Date().toISOString()

  const urls: SitemapUrl[] = [
    {
      loc: `${SITE_URL}/`,
      lastmod: generatedAt,
      priority: '1.00',
    },
    {
      loc: `${SITE_URL}/blog/`,
      lastmod: generatedAt,
      priority: '0.80',
    },
    {
      loc: `${SITE_URL}/gdpr/`,
      lastmod: generatedAt,
      priority: '0.50',
    },
    ...posts.map((post) => ({
      loc: `${SITE_URL}/blog/articles/${post.slug}/`,
      lastmod: toIsoDate(post.date),
      priority: '0.70',
    })),
  ]

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => createUrlEntry(url)).join('\n')}
</urlset>`

  const distPath = join(process.cwd(), 'dist', 'sitemap.xml')
  writeFileSync(distPath, xmlBody, 'utf-8')

  console.log(`✓ Generated sitemap.xml with ${urls.length} URLs`)
}

generateSitemap()
