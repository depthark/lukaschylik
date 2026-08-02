import { component$ } from '@qwik.dev/core'
import type { DocumentHead } from '@qwik.dev/router'
import Button from '~/components/button/button'
import Container from '~/components/container/container'
import Section from '~/components/section/section'

/**
 * Custom 404 page. Statically generated as `404.html` at build time,
 * which GitHub Pages serves automatically for unknown URLs.
 */
export default component$(() => {
  return (
    <Section id="not-found" className="dark:bg-black-800">
      <Container size="sm">
        <div class="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
          <p class="text-7xl font-bold">404</p>
          <h1 class="text-2xl font-semibold">Stránka sa nenašla</h1>
          <p class="max-w-prose">
            Stránka, ktorú hľadáte, neexistuje alebo bola presunutá. Skúste sa
            vrátiť na úvodnú stránku alebo si prezrite blog.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4">
            <Button href="/" variant="primary" size="md">
              Späť na úvod
            </Button>
            <Button href="/blog/" variant="secondary" size="md">
              Prejsť na blog
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
})

export const head: DocumentHead = {
  title: '404 – Stránka sa nenašla | Lukáš Chylík',
  meta: [
    {
      name: 'robots',
      content: 'noindex',
    },
    {
      name: 'description',
      content: 'Požadovaná stránka neexistuje alebo bola presunutá.',
    },
  ],
}
