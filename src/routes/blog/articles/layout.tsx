import { component$, Slot, useStyles$ } from '@qwik.dev/core'
import ArticleLayout from '~/components/blog/article-layout'
import shikiStyles from '~/styles/css/shiki.css?inline'

export { head } from '~/components/blog/article-layout'

/**
 * Article route layout delegating to the shared, URL-locale-aware
 * article layout. Serves the Slovak article tree.
 */
export default component$(() => {
  useStyles$(shikiStyles)
  return (
    <ArticleLayout>
      <Slot />
    </ArticleLayout>
  )
})
