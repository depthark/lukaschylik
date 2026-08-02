import { component$ } from '@qwik.dev/core'
import { cls } from '~/utils'
import type { ReferenceProps } from './reference.types'

const Reference = component$<ReferenceProps>(({ title, webURL, type }) => {
  return (
    <li class="border-b border-black/30 dark:border-white/30 md:border-black dark:md:border-white isolate hover:z-10 first:border-t relative">
      <a
        href={webURL}
        target="_blank"
        rel="noreferer"
        class="reference group flex just justify-between items-center gap-4 py-2 no-underline w-full min-w-0">
        <strong
          class={cls(
            'relative',
            'flex w-full lg:w-auto justify-between gap-2 md:gap-4 min-w-0',
            'text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-xl 2xl:text-2xl 3xl:text-4xl',
            'font-medium leading-normal tracking-wide uppercase whitespace-normal 3xl:whitespace-nowrap',
            'overflow-hidden z-20',
          )}>
          <span
            class="relative text-transparent duration-300 ease-in-out"
            title={title}>
            {title}
          </span>
          <small class="text-[10px] md:text-xs pt-1 lg:pt-1 xl:pt-2 2xl:pt-3 3xl:pt-4 text-black dark:text-white tracking-wider leading-none">
            {type}
          </small>
        </strong>
      </a>
    </li>
  )
})

export default Reference
