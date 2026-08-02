import { component$ } from '@qwik.dev/core'
import type { DocumentHead } from '@qwik.dev/router'
import { routeLoader$ } from '@qwik.dev/router'
import BlogListing, {
  createBlogListingHead,
} from '~/components/blog/blog-listing'
import { getAllPosts } from '~/utils/markdown.server'

export const useBlogPosts = routeLoader$(async () => {
  return getAllPosts('en')
})

/**
 * English blog listing route.
 */
export default component$(() => {
  const posts = useBlogPosts()
  return <BlogListing posts={posts.value} />
})

export const head: DocumentHead = createBlogListingHead('en')
