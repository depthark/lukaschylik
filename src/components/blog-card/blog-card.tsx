import { component$ } from '@qwik.dev/core'
import { Link } from '@qwik.dev/router'
import Icon from '~/components/icon/icon'
import { cls } from '~/utils'
import type { BlogPost } from '~/utils/markdown.server'

/**
 * Props for the BlogCard component
 */
export interface BlogCardProps {
  /** Blog post data to display */
  post: BlogPost
}

/**
 * Estimate reading time in minutes based on content length
 */
const getReadingTime = (content: string): number => {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ') // remove fenced code blocks
    .replace(/<[^>]+>/g, ' ') // remove HTML tags
    .replace(/[^\w\p{L}\s]+/gu, ' ') // remove punctuation
    .trim()
  const words = text ? text.split(/\s+/).length : 0
  // Multiply baseline reading time by 1.5x to better reflect real reading pace
  return Math.max(1, Math.ceil((words / 220) * 1.5))
}

/**
 * Blog card component that displays a blog post preview with themed gradient header
 */
const BlogCard = component$(({ post }: BlogCardProps) => {
  const minutes = getReadingTime(post.content)

  return (
    <Link
      href={`/blog/articles/${post.slug}/`}
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
            alt={`Ilustračný obrázok k článku: ${post.title}`}
            loading="lazy"
            decoding="async"
            width={1600}
            height={900}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
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
            {new Date(post.date).toLocaleDateString('cs-CZ')}
          </time>
          <span
            class={cls('flex items-center gap-2')}
            title={`Čas pre prečítanie článku: ${minutes} min`}>
            <Icon name="book" cls="w-4 h-4 sm:w-5 sm:h-5" />
            {minutes} min
          </span>
        </div>
      </div>
    </Link>
  )
})

export default BlogCard
