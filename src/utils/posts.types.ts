/**
 * Blog post metadata entry in the build-time posts manifest.
 */
export interface PostMeta {
  /** Unique slug identifier for the blog post */
  slug: string
  /** Title of the blog post */
  title: string
  /** Subtitle of the blog post */
  subtitle: string
  /** Short description or excerpt of the blog post */
  description: string
  /** Publication date in ISO format (YYYY-MM-DD) */
  date: string
  /** Author of the blog post */
  author: string
  /** Podcast URL of the blog post */
  podcastUrl: string | null
  /** Path to card image displayed on blog list */
  cardImg: string | null
  /** Estimated reading time in minutes */
  readingTime: number
}
