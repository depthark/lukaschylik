import { component$ } from '@qwik.dev/core'
import { cls } from '~/utils'
import type { SectionTitleProps } from './section.types'

const SectionTitle = component$<SectionTitleProps>(
  ({ text, className, dark, size = 'md', center }) => {
    const textSizeClasses =
      size === 'md'
        ? 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[clamp(3rem,6.5svi,7rem)] 2xl:text-[clamp(3rem,7svi,8rem)] 3xl:text-[clamp(3rem,8svi,10rem)]'
        : 'text-[max(20px,2.5rem)] sm:text-[max(20px,3rem)] md:text-[max(20px,3.5rem)] lg:text-[max(20px,4rem)] xl:text-[clamp(20px,3.25svi,3.5rem)] 2xl:text-[clamp(20px,3.5svi,4rem)] 3xl:text-[clamp(20px,4svi,5rem)]'

    return (
      <h2
        data-dark={dark}
        class={cls(
          'content-fade-in',
          'relative z-10',
          textSizeClasses,
          center && 'text-center content-fade-in--bottom',
          'mb-[5svb]',
          'font-sans',
          'font-extrabold uppercase leading-none tracking-widest',
          'text-black',
          className,
        )}>
        {text}
      </h2>
    )
  },
)

export default SectionTitle
