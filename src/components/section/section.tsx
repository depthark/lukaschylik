import { component$, Slot } from '@qwik.dev/core'
import { cls } from '~/utils'
import type { SectionProps } from './section.types'

const Section = component$<SectionProps>(
  ({ id, className, centerContent = true, fullHeight = true }) => {
    return (
      <section
        id={id}
        class={cls(
          'relative bg-white dark:bg-black py-10 md:py-[8svb] scroll-mt-[var(--nav_height)]',
          centerContent && 'grid items-center',
          fullHeight && 'min-h-screen',
          className,
        )}>
        <Slot />
      </section>
    )
  },
)

export default Section
