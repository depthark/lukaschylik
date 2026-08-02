import { component$, Slot } from '@qwik.dev/core'
import { type DocumentHead, routeLoader$ } from '@qwik.dev/router'
import ArticleLayout, {
  createArticleHead,
} from '~/components/blog/article-layout'
import { getAllPosts } from '~/utils/markdown.server'
import '~/styles/css/shiki.css'

/**
 * Route loader to fetch the current Slovak blog post based on the URL slug
 * @returns {BlogPost | null} The current blog post data or null if not found
 */
export const useCurrentPost = routeLoader$(async ({ status, url }) => {
  try {
    const urlParts = url.pathname.split('/')
    const slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2]

    if (!slug || slug === 'articles') {
      return null
    }

    const post = getAllPosts('sk').find((p) => p.slug === slug)

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
 * Slovak article route layout delegating to the shared article layout.
 */
export default component$(() => {
  const post = useCurrentPost()

  return (
    <ArticleLayout post={post.value}>
      <Slot />
    </ArticleLayout>
  )
})

/**
 * Dynamic head metadata for Slovak blog posts
 */
export const head: DocumentHead = ({ resolveValue }) => {
  return createArticleHead(resolveValue(useCurrentPost), 'sk')
}
