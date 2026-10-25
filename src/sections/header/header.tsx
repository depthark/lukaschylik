import { component$ } from '@qwik.dev/core'
import { Button, Container } from '~/components'
import { useLocale } from '~/i18n'
import { cls } from '~/utils'
import i18n from './header.i18n.json'

/**
 * Intro header with the glitch name title, subtitle and CTA button.
 */
const Header = component$(() => {
  const t = i18n[useLocale()]

  return (
    <header
      class={cls(
        'grid place-items-center content-center',
        'bg-white dark:bg-black',
      )}>
      <Container size="lg" className="relative z-10 isolate">
        <div
          class={cls('intro', 'grid gap-4 place-items-center content-center')}>
          <h1
            class={cls(
              'intro__title',
              'opacity-0 scale-75',
              'text-7xl sm:text-8xl lg:text-[clamp(3rem,16svb,12rem)]',
              '!text-black dark:!text-white text-center',
              'font-extrabold uppercase leading-none tracking-widest',
              'relative z-10',
            )}
            data-glitch={t.name.join('\n')}>
            {t.name[0]}
            <br />
            {t.name[1]}
          </h1>
          <div class={cls('grid place-items-center content-center')}>
            <strong
              class={cls(
                'intro__subtitle',
                'block',
                'px-[.25em]',
                'text-[3.5svb] lg:text-[clamp(1rem,3.8svb,3.5rem)]',
                'text-black bg-secondary rounded-lg',
                'font-medium',
              )}>
              {t.subtitle}
            </strong>
            <div class="inline-flex gap-32 place-items-center content-center mt-16">
              <Button
                href="#about-me"
                variant="primary"
                size="md"
                title={t.cta}
                className="intro__btn">
                {t.cta}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </header>
  )
})

export default Header
