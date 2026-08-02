import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { DEFAULT_LOCALE, type Locale } from '~/i18n/core'

/**
 * Represents a blog post with metadata and content
 */
export interface BlogPost {
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
  podcastUrl?: string
  /** Optional path to card image displayed on blog list */
  cardImg?: string
  /** Raw Markdown content of the blog post */
  content: string
}

/**
 * Resolves the articles directory for the given locale
 * @param locale - Content locale (sk articles live at the routes root, en under routes/en)
 */
const getPostsDirectory = (locale: Locale): string =>
  locale === DEFAULT_LOCALE
    ? path.join(process.cwd(), 'src', 'routes', 'blog', 'articles')
    : path.join(process.cwd(), 'src', 'routes', 'en', 'blog', 'articles')

/**
 * Reads and parses a markdown file at the given path
 * @param {string} filePath - Path to the markdown file
 * @returns {BlogPost | null} Parsed blog post or null if file doesn't exist or has invalid format
 */
const readMarkdownFile = (filePath: string, slug: string): BlogPost | null => {
  try {
    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    if (!data.title || !data.description || !data.date || !data.author) {
      console.error(`Missing required metadata in ${filePath}`)
      return null
    }

    return {
      slug,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      date:
        data.date instanceof Date
          ? data.date.toISOString().split('T')[0]
          : data.date,
      author: data.author,
      podcastUrl: data.podcastUrl,
      cardImg: data.cardImg,
      content,
    }
  } catch (error) {
    console.error(`Error reading markdown file ${filePath}:`, error)
    return null
  }
}

/**
 * Finds the markdown file for a blog post by checking both .mdx and .md extensions
 * @param {string} slug - The blog post slug
 * @returns {BlogPost | null} The blog post data or null if not found
 */
const findPostBySlug = (slug: string, locale: Locale): BlogPost | null => {
  const postsDirectory = getPostsDirectory(locale)
  const mdxPath = path.join(postsDirectory, slug, 'index.mdx')
  const mdxPost = readMarkdownFile(mdxPath, slug)
  if (mdxPost) {
    return mdxPost
  }

  const mdPath = path.join(postsDirectory, slug, 'index.md')
  return readMarkdownFile(mdPath, slug)
}

/**
 * Gets all blog posts from the articles directory
 * @returns {BlogPost[]} Array of blog posts sorted by date (newest first)
 */
export const getAllPosts = (locale: Locale = DEFAULT_LOCALE): BlogPost[] => {
  try {
    const slugs = fs
      .readdirSync(getPostsDirectory(locale), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const allPostsData = slugs
      .map((slug) => findPostBySlug(slug, locale))
      .filter((post): post is BlogPost => post !== null)

    return allPostsData.toSorted(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  } catch (error) {
    console.error('Error reading blog posts directory:', error)
    return []
  }
}
