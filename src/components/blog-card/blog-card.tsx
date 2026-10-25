import { component$ } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import Icon from '~/components/icon/icon'
import { localizePath, useLocale } from '~/i18n'
import { cls } from '~/utils'
import type { PostMeta } from '~/utils/posts.types'
import i18n from './blog-card.i18n.json'

/**
 * Props for the BlogCard component
 */
interface BlogCardProps {
  /** Blog post data to display */
  post: PostMeta
  /** Loads the cover eagerly with high priority (first card above the fold) */
  priority?: boolean
}

/**
 * Blog card component that displays a blog post preview with themed gradient header
 */
const BlogCard = component$(({ post, priority = false }: BlogCardProps) => {
  const locale = useLocale()
  const t = i18n[locale]
  const minutes = post.readingTime

  return (
    <Link
      href={localizePath(`/blog/articles/${post.slug}/`, locale)}
      class={cls(
        'card overflow-clip',
        'group relative block',
        'grid grid-rows-subgrid row-span-4 gap-6 sm:gap-8',
        'border-2 border-black dark:border-white rounded-lg',
        'text-black dark:text-white',
        'bg-white dark:bg-black',
      )}>
      <div
        class={cls(
          'relative aspect-[2/1] overflow-hidden',
          'border-b-2 border-b-black dark:border-b-white',
          'rounded-t-[inherit]',
          'bg-black',
        )}
        style={{ viewTransitionName: `blog-img-${post.slug}` }}>
        {post.cardImg && (
          <img
            src={post.cardImg}
            alt={t.coverAlt.replace('{title}', post.title)}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            width={1600}
            height={900}
            class={cls(
              'absolute inset-0 w-full h-full object-cover',
              'transition-transform duration-[1000ms] ease-in-out will-change-transform',
              'group-hover:scale-[1.2]',
            )}
          />
        )}
      </div>

      <div
        class={cls(
          'grid grid-rows-subgrid row-span-2',
          'gap-inherit',
          'px-6 sm:px-8',
          'text-base lg:text-xl font-mono',
          'leading-relaxed font-light',
          'text-black dark:text-white',
          'content-start',
        )}>
        <div>
          <strong
            class={cls('block', 'text-xl', 'mb-2', 'line-clamp-2')}
            style={{ viewTransitionName: `blog-title-${post.slug}` }}>
            {post.title}
          </strong>
          <p
            class={cls(
              'text-sm sm:text-base lg:text-sm',
              'text-gray-700 dark:text-gray-300',
            )}>
            {post.subtitle}
          </p>
        </div>

        <div
          class={cls(
            'flex items-center justify-between',
            'text-xs sm:text-sm',
            'text-gray-500 dark:text-gray-400',
            'mt-auto',
          )}>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(
              locale === 'sk' ? 'sk-SK' : 'en-GB',
            )}
          </time>
          <span
            class={cls('flex items-center gap-2')}
            title={t.readingTimeTitle.replace('{minutes}', String(minutes))}>
            <Icon name="book" cls="w-4 h-4 sm:w-5 sm:h-5" />
            {minutes} {t.readingTimeUnit}
          </span>
        </div>
      </div>
    </Link>
  )
})

export default BlogCard
