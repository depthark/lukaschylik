import { component$ } from '@qwik.dev/core'
import type { DocumentHead } from '@qwik.dev/router'
import Button from '~/components/button/button'
import Container from '~/components/container/container'
import Section from '~/components/section/section'
import type { Locale } from '~/i18n'
import ui from '~/i18n/ui.json'

/**
 * Custom 404 page. Statically generated as `404.html` at build time, which
 * GitHub Pages serves for any unknown URL — in both locales, since the host
 * serves a single 404 document. Content is therefore rendered bilingually.
 */
export default component$(() => {
  const locales: Locale[] = ['sk', 'en']

  return (
    <Section id="not-found" className="dark:bg-black-800">
      <Container size="sm">
        <div class="flex min-h-[60vh] flex-col items-center justify-center gap-10 text-center">
          <p class="text-7xl font-bold">404</p>
          {locales.map((locale) => {
            const t = ui[locale].notFound
            return (
              <div key={locale} lang={locale} class="flex flex-col gap-4">
                <h2 class="text-2xl font-semibold">{t.title}</h2>
                <p class="max-w-prose">{t.message}</p>
                <div class="flex flex-wrap items-center justify-center gap-4">
                  <Button
                    href={locale === 'sk' ? '/' : '/en/'}
                    variant="primary"
                    size="md">
                    {t.backHome}
                  </Button>
                  <Button
                    href={locale === 'sk' ? '/blog/' : '/en/blog/'}
                    variant="secondary"
                    size="md">
                    {t.goToBlog}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
})

export const head: DocumentHead = {
  title: ui.sk.notFound.headTitle,
  meta: [
    {
      name: 'robots',
      content: 'noindex',
    },
    {
      name: 'description',
      content: ui.sk.notFound.headDescription,
    },
  ],
}
