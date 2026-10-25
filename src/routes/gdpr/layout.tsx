import { component$, Slot, useStyles$ } from '@qwik.dev/core'
import type { DocumentHead } from '@qwik.dev/router'
import Container from '~/components/container/container'
import Section from '~/components/section/section'
import { getLocaleFromPathname } from '~/i18n'
import i18n from './gdpr.i18n.json'
import shikiStyles from '~/styles/css/shiki.css?inline'

/**
 * Simple layout wrapper for the GDPR page.
 * Reuses the `.blog` typography styles for readable Markdown.
 */
export default component$(() => {
  useStyles$(shikiStyles)
  return (
    <Section id="gdpr" className=" dark:bg-black-800">
      <Container size="sm">
        <article class="blog">
          <Slot />
        </article>
      </Container>
    </Section>
  )
})

/**
 * Locale-aware document head for the GDPR page, resolved from the request URL.
 */
export const head: DocumentHead = ({ url }) => {
  const t = i18n[getLocaleFromPathname(url.pathname)]

  return {
    title: t.title,
    meta: [
      {
        name: 'description',
        content: t.description,
      },
    ],
  }
}
