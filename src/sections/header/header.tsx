import { $, component$, useOn } from '@qwik.dev/core'
import { Button, Container } from '~/components'
import { cls } from '~/utils'

const Header = component$(() => {
  useOn(
    'qvisible',
    $(() => {
      const titleElement = document.querySelector(
        '.intro__title',
      ) as HTMLElement
      if (titleElement) {
        // Set the client dimensions as data attributes for use in CSS
        const clientHeight = titleElement.clientHeight
        const clientWidth = titleElement.clientWidth
        console.log('Title element height:', clientHeight)
        console.log('Title element width:', clientWidth)
        titleElement.setAttribute('data-height', clientHeight.toString())
        titleElement.setAttribute('data-width', clientWidth.toString())
        console.log(
          'Data attributes set - height:',
          titleElement.getAttribute('data-height'),
          'width:',
          titleElement.getAttribute('data-width'),
        )
      }
    }),
  )

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
            data-glitch="Lukáš
Chylík"
            data-height="200"
            data-width="800">
            Lukáš
            <br />
            Chylík
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
              Creative web developer
            </strong>
            <div class="inline-flex gap-32 place-items-center content-center mt-16">
              <Button
                href="#about-me"
                variant="primary"
                size="md"
                title="Kto som?"
                className="intro__btn">
                Kto som?
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </header>
  )
})

export default Header
