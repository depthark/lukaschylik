import { component$, Slot } from '@qwik.dev/core'
import ArticleLayout from '~/components/blog/article-layout'
import '~/styles/css/shiki.css'

export { head } from '~/components/blog/article-layout'

/**
 * Article route layout delegating to the shared, URL-locale-aware
 * article layout. Serves the Slovak article tree.
 */
export default component$(() => {
  return (
    <ArticleLayout>
      <Slot />
    </ArticleLayout>
  )
})
