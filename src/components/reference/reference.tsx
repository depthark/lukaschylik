import { component$ } from '@qwik.dev/core'
import { Icon } from '~/components'
import { cls } from '~/utils'
import type { ReferenceProps } from './reference.types'

/**
 * Single client/collaboration reference row: title with hover flip effect,
 * website domain, a type badge and an external-link indicator.
 */
const Reference = component$<ReferenceProps>(
  ({ title, webURL, website, type, img }) => {
    return (
      <li class="border-b border-black/30 dark:border-white/30 first:border-t isolate hover:z-10 relative">
        <a
          href={webURL}
          target="_blank"
          rel="noopener noreferrer"
          class="reference group grid grid-cols-[1fr_auto] items-center gap-4 py-2.5 no-underline w-full min-w-0">
          <span class="relative z-10 min-w-0 grid gap-1">
            <strong
              class={cls(
                'relative overflow-hidden',
                'text-lg sm:text-xl md:text-2xl lg:text-lg xl:text-xl 2xl:text-2xl',
                'font-medium leading-tight tracking-wide uppercase',
              )}>
              <span
                class="reference__flip relative inline-block text-transparent duration-300 ease-in-out"
                title={title}>
                {title}
              </span>
            </strong>
            <small class="font-mono text-[11px] md:text-xs text-gray-500 dark:text-gray-400 tracking-wider">
              {website}
            </small>
          </span>
          {img && (
            <img
              src={img}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              width={425}
              height={425}
              class={cls(
                'reference__preview',
                'hidden lg:block',
                'absolute -start-24 top-1/2 -translate-y-1/2',
                'w-[min(300px,22vw)] aspect-square rounded-full object-cover object-top',
                'border-4 border-black dark:border-white',
                'shadow-2xl',
                'opacity-0 group-hover:opacity-100',
                'motion-safe:scale-75 motion-safe:group-hover:scale-100',
                'motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out',
                'pointer-events-none select-none z-0',
              )}
            />
          )}
          <span class="relative z-10 flex items-center gap-2 md:gap-3 shrink-0">
            <span
              class={cls(
                'inline-flex items-center rounded-full',
                'border border-black/20 dark:border-white/25',
                'px-2.5 py-1',
                'text-[10px] font-mono uppercase tracking-wider',
                'text-gray-600 dark:text-gray-300',
                'transition-colors duration-300',
                'group-hover:border-yellow-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-400',
              )}>
              {type}
            </span>
            <span
              class="text-black dark:text-white opacity-40 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true">
              <Icon name="link" size="1rem" color="currentColor" />
            </span>
          </span>
        </a>
      </li>
    )
  },
)

export default Reference
