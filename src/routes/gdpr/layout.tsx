import { component$, Slot } from '@qwik.dev/core'
import type { DocumentHead } from '@qwik.dev/router'
import Container from '~/components/container/container'
import Section from '~/components/section/section'
import '~/styles/css/shiki.css'

/**
 * Simple layout wrapper for the GDPR page.
 * Reuses the `.blog` typography styles for readable Markdown.
 */
export default component$(() => {
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

export const head: DocumentHead = {
  title: 'Ochrana osobných údajov (GDPR) | Lukáš Chylík',
  meta: [
    {
      name: 'description',
      content:
        'Transparentné informácie o spracúvaní osobných údajov, právnych základoch, cookies a právach dotknutých osôb.',
    },
  ],
}
