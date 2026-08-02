import type { Locale } from '~/i18n/core'
import manifest from '../generated/posts-manifest.json'
import type { PostMeta } from './posts.types'

/**
 * Returns all posts for the given locale from the build-time manifest,
 * sorted by date (newest first).
 * @param locale - Content locale
 */
export const getPosts = (locale: Locale): PostMeta[] => manifest[locale]

/**
 * Finds a post by slug in the given locale.
 * @param locale - Content locale
 * @param slug - Article slug
 */
export const findPost = (locale: Locale, slug: string): PostMeta | null =>
  manifest[locale].find((post) => post.slug === slug) ?? null
