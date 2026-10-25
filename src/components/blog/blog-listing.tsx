import { component$, useComputed$, useSignal } from '@qwik.dev/core'
import type { DocumentHead } from '@qwik.dev/router'
import { BlogCard } from '~/components/blog-card'
import Container from '~/components/container/container'
import Icon from '~/components/icon/icon'
import Section from '~/components/section/section'
import SectionTitle from '~/components/section/section.title'
import { getLocaleFromPathname, useLocale } from '~/i18n'
import Newsletter from '~/sections/newsletter/newsletter'
import { cls } from '~/utils'
import { getPosts } from '~/utils/posts'
import i18n from './blog-listing.i18n.json'

/**
 * Document head for the blog listing routes; locale derived from the URL so a
 * single export serves both /blog and /en/blog.
 */
export const head: DocumentHead = ({ url }) => {
  const t = i18n[getLocaleFromPathname(url.pathname)]

  return {
    title: t.headTitle,
    meta: [
      {
        name: 'description',
        content: t.headDescription,
      },
    ],
  }
}

/**
 * Locale-aware blog listing with client-side title/subtitle search.
 * Shared by the sk (/blog) and en (/en/blog) routes; posts come from the
 * build-time manifest.
 */
const BlogListing = component$(() => {
  const locale = useLocale()
  const t = i18n[locale]
  const posts = getPosts(locale)
  const searchQuery = useSignal('')

  /**
   * Filters blog posts based on search query.
   * Searches through post titles and subtitles (case-insensitive).
   * Returns all posts if search query is empty.
   *
   * @returns Filtered array of blog posts matching the search criteria
   */
  const filteredPosts = useComputed$(() => {
    if (!searchQuery.value.trim()) {
      return posts
    }

    const query = searchQuery.value.toLowerCase()
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.subtitle.toLowerCase().includes(query),
    )
  })

  return (
    <>
      <Section id="blog" centerContent={false}>
        <Container size="sm">
          <SectionTitle text={t.title} />
          <p
            class={cls(
              'text-sm lg:text-base 3xl:text-lg',
              'leading-relaxed font-light',
              'mb-8 md:mb-12',
              'text-gray-800 dark:text-gray-300',
              'font-mono text-pretty',
            )}>
            {t.intro}
          </p>
          <div
            class={cls(
              'sticky pb-8 md:pb-12',
              'top-[var(--nav_height)]',
              'bg-gradient-to-b from-white from-65% to-transparent',
              'dark:from-black dark:from-65% dark:to-transparent isolation-auto z-10',
            )}>
            <input
              type="search"
              placeholder={t.searchPlaceholder}
              class={cls(
                'w-full px-4 py-3 text-lg',
                'border border-box border-gray-300 dark:border-gray-400',
                'rounded-lg',
                'text-black dark:text-white',
                'placeholder-gray-500 dark:placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent',
              )}
              value={searchQuery.value}
              onInput$={(_, el) => {
                searchQuery.value = el.value
              }}
            />
          </div>

          <div
            class={cls(
              'grid gap-6 md:gap-8',
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
              'grid-rows-[repeat(auto-fill,auto_1fr_auto)]',
            )}>
            {filteredPosts.value.length > 0 ? (
              filteredPosts.value.map((post, index) => (
                <BlogCard key={post.slug} post={post} priority={index === 0} />
              ))
            ) : (
              <div
                class={cls(
                  'col-span-full',
                  'flex flex-col items-center justify-center',
                  'gap-4 md:gap-6',
                  'text-center text-xl',
                  'text-gray-800 dark:text-gray-300',
                  'py-16',
                )}>
                <Icon
                  name="sad-face"
                  cls="w-[50px] h-[50px] md:w-[100px] md:h-[100px]"
                />
                <div>
                  {searchQuery.value.trim() ? t.emptySearch : t.emptyList}
                </div>
              </div>
            )}
          </div>
        </Container>
      </Section>
      <Newsletter />
    </>
  )
})

export default BlogListing
