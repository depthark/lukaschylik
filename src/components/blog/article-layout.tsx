import { $, component$, Slot, useContext } from '@qwik.dev/core'
import { type DocumentHead, Link } from '@qwik.dev/router'
import { Icon } from '~/components'
import { BlogProgress } from '~/components/blog/BlogProgress'
import Container from '~/components/container/container'
import Section from '~/components/section/section'
import { type Locale, localizePath, useLocale } from '~/i18n'
import Newsletter from '~/sections/newsletter/newsletter'
import { AlertContext } from '~/utils'
import type { BlogPost } from '~/utils/markdown.server'
import i18n from './article-layout.i18n.json'

interface ArticleLayoutProps {
  /** Blog post resolved by the route loader, null when not found */
  post: BlogPost | null
}

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
 * Creates the document head for an article route in the given locale.
 * @param post - Resolved blog post (or null)
 * @param locale - Locale of the article route
 */
export const createArticleHead = (
  post: BlogPost | null,
  locale: Locale,
): ReturnType<Extract<DocumentHead, (...args: never[]) => unknown>> => {
  const t = i18n[locale]
  const site = 'https://lukaschylik.dev'
  const articlesBase = localizePath('/blog/articles/', locale)
  const canonicalUrl = post?.slug
    ? `${site}${articlesBase}${post.slug}/`
    : `${site}${articlesBase}`
  const imageAbs = post?.cardImg
    ? /^https?:\/\//i.test(post.cardImg)
      ? post.cardImg
      : `${site}${post.cardImg}`
    : undefined

  return {
    title: `${post?.title} | ${t.headTitleSuffix}`,
    meta: [
      {
        name: 'description',
        content: post?.description,
      },
      {
        property: 'og:type',
        content: 'article',
      } as any,
      post?.date
        ? ({ property: 'article:published_time', content: post.date } as any)
        : undefined,
      post?.author
        ? ({ property: 'article:author', content: post.author } as any)
        : undefined,
    ].filter(Boolean) as any,
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
              inLanguage: locale,
              publisher: { '@type': 'Person', name: 'Lukáš Chylík' },
            }),
            props: { type: 'application/ld+json' },
          },
        ]
      : [],
  }
}

/**
 * Universal blog detail layout that wraps all blog article content.
 * Shared by the sk and en article routes; provides consistent styling,
 * scroll progress and heading copy-link handling.
 */
const ArticleLayout = component$<ArticleLayoutProps>(({ post }) => {
  const locale = useLocale()
  const t = i18n[locale]
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
      alertContext.showAlert(t.copyUnsupported)
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
      alertContext.showAlert(t.copySuccess)
    } catch (error) {
      console.error('Failed to copy blog heading URL:', error)
      alertContext.showAlert(t.copyError)
    }
  })

  return (
    <>
      <Section id="blog-detail" className=" dark:bg-black-800">
        <BlogProgress />
        <Container size="blog">
          <Link
            href={localizePath('/blog/', locale)}
            class="inline-flex items-center text-gray-800 dark:text-gray-300 mb-6 underline underline-offset-4">
            {t.backToList}
          </Link>

          <article
            class="blog dark:bg-gray-900 bg-gray-100"
            onClick$={handleHeadingCopy}>
            {post && (
              <header class="mb-8">
                {post.cardImg && (
                  <div
                    class="relative aspect-[2/1] overflow-hidden rounded-t-lg -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 md:-mx-10 md:-mt-10 mb-8"
                    style={{
                      viewTransitionName: `blog-img-${post.slug}`,
                    }}>
                    <img
                      src={post.cardImg}
                      alt={`${t.coverAlt}: ${post.title}`}
                      width={1600}
                      height={900}
                      class="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
                <h1
                  class="text-4xl md:text-5xl lg:text-6xl mb-4 font-bold text-gray-800 dark:text-gray-300 leading-tight md:leading-tight lg:leading-tight"
                  style={{
                    viewTransitionName: `blog-title-${post.slug}`,
                  }}>
                  {post.title}
                  <small class="mt-2 block">{post.subtitle}</small>
                </h1>
                <div class="flex items-center justify-between gap-2">
                  <div class="flex gap-2 items-center text-sm text-gray-800 dark:text-gray-300">
                    <time
                      dateTime={post.date}
                      class="text-gray-800 dark:text-gray-300">
                      {new Date(post.date).toLocaleDateString(
                        locale === 'sk' ? 'sk-SK' : 'en-GB',
                      )}
                    </time>
                    <span class="text-yellow-500 text-2xl">•</span>
                    <span>{post.author}</span>
                    <span class="text-yellow-500 text-2xl">•</span>
                    <span
                      class="flex items-center gap-2"
                      title={`${t.readingTime}: ${getReadingTime(post.content)} ${t.minutes}`}>
                      <Icon name="book" cls="w-4 h-4 sm:w-5 sm:h-5" />
                      {getReadingTime(post.content)} {t.minutes}
                    </span>
                  </div>
                  {post.podcastUrl && (
                    <a
                      class="podcast-link grid place-items-center ratio-1/1 border-0 text-black dark:text-white bg-transparent hover:text-[#1DB954] transition-colors duration-200 rounded-full"
                      href={post.podcastUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.playPodcast}>
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

export default ArticleLayout
