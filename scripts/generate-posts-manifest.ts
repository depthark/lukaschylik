import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Locale } from '../src/i18n/core'
import type { PostMeta } from '../src/utils/posts.types'
import { type BlogPost, getAllPosts } from '../src/utils/markdown.server'

/**
 * Estimate reading time in minutes based on content length (1.5x factor)
 */
const getReadingTime = (content: string): number => {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\w\p{L}\s]+/gu, ' ')
    .trim()
  const words = text ? text.split(/\s+/).length : 0
  return Math.max(1, Math.ceil((words / 220) * 1.5))
}

const toMeta = (post: BlogPost): PostMeta => ({
  slug: post.slug,
  title: post.title,
  subtitle: post.subtitle,
  description: post.description,
  date: post.date,
  author: post.author,
  podcastUrl: post.podcastUrl ?? null,
  cardImg: post.cardImg ?? null,
  readingTime: getReadingTime(post.content),
})

/**
 * Generates a static per-locale posts manifest consumed by the blog listing
 * and article layout at render time. Replaces `routeLoader$` usage in layouts,
 * which returns undefined in production builds of the Qwik 2 beta.
 */
const generateManifest = (): void => {
  const locales: Locale[] = ['sk', 'en']
  const manifest = Object.fromEntries(
    locales.map((locale) => [locale, getAllPosts(locale).map(toMeta)]),
  )

  const outDir = join(process.cwd(), 'src', 'generated')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(
    join(outDir, 'posts-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf-8',
  )

  console.log(
    `✓ Generated posts manifest (sk: ${manifest.sk.length}, en: ${manifest.en.length})`,
  )
}

generateManifest()
