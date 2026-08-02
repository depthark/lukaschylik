import { $, component$, Slot, useContext } from '@qwik.dev/core'
import { type DocumentHead, Link, routeLoader$ } from '@qwik.dev/router'
import { Icon } from '~/components'
import { BlogProgress } from '~/components/blog/BlogProgress'
import Container from '~/components/container/container'
import Section from '~/components/section/section'
import Newsletter from '~/sections/newsletter/newsletter'
import { AlertContext } from '~/utils'
import { getAllPosts } from '~/utils/markdown.server'
import '~/styles/css/shiki.css'

/**
 * Estimate reading time in minutes based on content length (1.5x factor)
 */
const getReadingTime = (content: string): number => {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ') // remove fenced code
    .replace(/<[^>]+>/g, ' ') // remove HTML tags
    .replace(/[^\w\p{L}\s]+/gu, ' ') // remove punctuation
    .trim()
  const words = text ? text.split(/\s+/).length : 0
  return Math.max(1, Math.ceil((words / 220) * 1.5))
}

/**
 * Route loader to fetch the current blog post data based on the URL slug
 * Follows Qwik's pattern for efficient data loading and resumability
 * @returns {BlogPost | null} The current blog post data or null if not found
 */
export const useCurrentPost = routeLoader$(async ({ status, url }) => {
  try {
    const urlParts = url.pathname.split('/')
    const slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2]

    if (!slug || slug === 'articles') {
      return null
    }

    const allPosts = getAllPosts()
    const post = allPosts.find((p) => p.slug === slug)

    if (!post) {
      status(404)
      return null
    }

    return post
  } catch {
    status(500)
    return null
  }
})

/**
 * Universal blog detail layout that wraps all blog article content
 * This component serves as a parent layout for all blog posts,
 * providing consistent styling, structure, and functionality like
 * the scroll progress indicator and social sharing buttons.
 * @returns {JSX.Element} The blog layout component with nested content
 */
export default component$(() => {
  const post = useCurrentPost()
  const alertContext = useContext(AlertContext)

  /**
   * Handles delegated clicks on generated heading copy links.
   */
  const handleHeadingCopy = $(async (event: Event) => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return
    }

    const eventTarget = event.target
    if (!(eventTarget instanceof Element)) {
      return
    }

    const copyLink = eventTarget.closest<HTMLAnchorElement>(
      '[data-copy-heading]',
    )
    if (!copyLink) {
      return
    }

    event.preventDefault()

    if (!navigator.clipboard?.writeText) {
      alertContext.showAlert('Kopírovanie odkazu nie je podporované.')
      return
    }

    const headingHash = copyLink.getAttribute('href')
    if (!headingHash) {
      return
    }

    const sectionUrl = new URL(window.location.href)
    sectionUrl.hash = headingHash

    try {
      await navigator.clipboard.writeText(sectionUrl.toString())
      window.history.replaceState({}, document.title, sectionUrl.toString())
      alertContext.showAlert('Odkaz na sekciu bol skopírovaný.')
    } catch (error) {
      console.error('Failed to copy blog heading URL:', error)
      alertContext.showAlert('Nepodarilo sa skopírovať odkaz na sekciu.')
    }
  })

  return (
    <>
      <Section id="blog-detail" className=" dark:bg-black-800">
        <BlogProgress />
        <Container size="blog">
          <Link
            href="/blog/"
            class="inline-flex items-center text-gray-800 dark:text-gray-300 mb-6 underline underline-offset-4">
            ← Späť na zoznam článkov
          </Link>

          <article
            class="blog dark:bg-gray-900 bg-gray-100"
            onClick$={handleHeadingCopy}>
            {post.value && (
              <header class="mb-8">
                {post.value.cardImg && (
                  <div
                    class="relative aspect-[2/1] overflow-hidden rounded-t-lg -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 md:-mx-10 md:-mt-10 mb-8"
                    style={{
                      viewTransitionName: `blog-img-${post.value.slug}`,
                    }}>
                    <img
                      src={post.value.cardImg}
                      alt={`Ilustračný obrázok k článku: ${post.value.title}`}
                      width={1600}
                      height={900}
                      class="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
                <h1
                  class="text-4xl md:text-5xl lg:text-6xl mb-4 font-bold text-gray-800 dark:text-gray-300 leading-tight md:leading-tight lg:leading-tight"
                  style={{
                    viewTransitionName: `blog-title-${post.value.slug}`,
                  }}>
                  {post.value.title}
                  <small class="mt-2 block">{post.value.subtitle}</small>
                </h1>
                <div class="flex items-center justify-between gap-2">
                  <div class="flex gap-2 items-center text-sm text-gray-800 dark:text-gray-300">
                    <time
                      dateTime={post.value.date}
                      class="text-gray-800 dark:text-gray-300">
                      {new Date(post.value.date).toLocaleDateString('cs-CZ')}
                    </time>
                    <span class="text-yellow-500 text-2xl">•</span>
                    <span>{post.value.author}</span>
                    <span class="text-yellow-500 text-2xl">•</span>
                    <span
                      class="flex items-center gap-2"
                      title={`Čas pre prečítanie článku: ${getReadingTime(
                        post.value.content,
                      )} min`}>
                      <Icon name="book" cls="w-4 h-4 sm:w-5 sm:h-5" />
                      {getReadingTime(post.value.content)} min
                    </span>
                  </div>
                  {post.value.podcastUrl && (
                    <a
                      class="podcast-link grid place-items-center ratio-1/1 border-0 text-black dark:text-white bg-transparent hover:text-[#1DB954] transition-colors duration-200 rounded-full"
                      href={post.value.podcastUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Prehrať Podcast na Spotify">
                      <Icon name="spotify" size="2.5rem" />
                    </a>
                  )}
                </div>
              </header>
            )}
            <Slot />
          </article>
        </Container>
      </Section>
      <Newsletter />
    </>
  )
})

/**
 * Dynamic head metadata for blog posts
 * Falls back to default values if frontmatter data is missing
 * @param {Object} props - The head props object containing metadata from MDX frontmatter
 * @returns {DocumentHead} The document head metadata for the blog post
 */
export const head: DocumentHead = ({ head: _head, resolveValue }) => {
  const post = resolveValue(useCurrentPost)
  const site = 'https://lukaschylik.dev'
  const canonicalUrl = post?.slug
    ? `${site}/blog/articles/${post.slug}/`
    : `${site}/blog/articles/`
  const imageAbs = post?.cardImg
    ? /^https?:\/\//i.test(post.cardImg)
      ? post.cardImg
      : `${site}${post.cardImg}`
    : undefined

  return {
    title: `${post?.title} | Blog | Lukáš Chylík`,
    meta: [
      {
        name: 'description',
        content: post?.description,
      },
      // Open Graph article specifics
      {
        property: 'og:type',
        content: 'article',
      } as any,
      // Article metadata
      post?.date
        ? ({ property: 'article:published_time', content: post.date } as any)
        : undefined,
      post?.author
        ? ({ property: 'article:author', content: post.author } as any)
        : undefined,
    ].filter(Boolean) as any,
    // Canonical is set globally by RouterHead using current URL
    scripts: imageAbs
      ? [
          {
            key: 'blog-structured-data',
            script: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post?.title,
              description: post?.description,
              image: [imageAbs],
              author: { '@type': 'Person', name: post?.author },
              datePublished: post?.date,
              dateModified: post?.date,
              mainEntityOfPage: canonicalUrl,
              publisher: { '@type': 'Person', name: 'Lukáš Chylík' },
            }),
            props: { type: 'application/ld+json' },
          },
        ]
      : [],
  }
}
