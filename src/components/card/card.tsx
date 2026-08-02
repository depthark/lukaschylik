import { component$, Slot } from '@qwik.dev/core'
import { cls } from '~/utils'
import { Button } from '../button'
import type { CardProps } from './card.types'

const formatPrice = (price: number) => {
  return price >= 10000
    ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    : price.toString()
}

/**
 * Card component that displays content in a card format
 */
const Card = component$(
  ({
    title,
    price,
    priceLabel,
    priceNote,
    available = true,
    onClick$,
  }: CardProps) => {
    const CardContent = (
      <>
        <h3
          title={title}
          class={cls(
            'relative block',
            'text-2xl sm:text-3xl lg:text-2xl xl:text-5xl 2xl:text-[clamp(1.5rem,2.5svi,2.25rem)] 3xl:text-[clamp(1.75rem,3svi,2.75rem)]',
            'font-regular tracking-widest 3xl:tracking-[.15em]',
            'py-3 sm:py-6 px-6 sm:px-8',
            'border-b-2 border-b-black dark:border-b-white text-black dark:text-white',
            'text-transparent',
            'uppercase overflow-clip',
          )}>
          {title}
        </h3>
        <div
          class={cls(
            'grid grid-rows-subgrid row-span-2',
            'gap-inherit',
            'px-6 sm:px-8',
            'text-base lg:text-xl font-mono',
            'leading-relaxed font-light',
            'text-black dark:text-white',
            'content-start',
          )}>
          <Slot />
        </div>
        <div
          class={cls(
            'flex justify-between flex-col 2xl:flex-row',
            'gap-5 p-6 sm:p-8',
            'items-stretch 2xl:items-center',
          )}>
          <strong
            class={cls(
              'inline-block',
              'text-center 2xl:text-start',
              'font-bold whitespace-nowrap',
              'text-2xl sm:text-3xl 3xl:text-4xl',
            )}>
            {priceLabel
              ? priceLabel
              : price != null
                ? `${formatPrice(price)} Kč`
                : 'Na mieru'}
            {priceNote && (
              <small class="block text-xs sm:text-sm font-light opacity-80">
                {priceNote}
              </small>
            )}
          </strong>
          <Button
            variant="secondary"
            className="whitespace-nowrap"
            ariaLabel={available ? `Mám záujem` : 'Nedostupné'}
            title={available ? `Mám záujem` : 'Nedostupné'}
            disabled={!available}
            onClick$={onClick$}>
            {available ? `Mám záujem` : 'Nedostupné'}
          </Button>
        </div>
      </>
    )

    return (
      <div
        class={cls(
          'card overflow-clip',
          'group relative',
          'grid grid-rows-subgrid row-span-4 gap-6 sm:gap-8',
          'border-2 border-black dark:border-white rounded-lg',
          'text-black dark:text-white',
          'bg-white dark:bg-black',
        )}>
        {CardContent}
      </div>
    )
  },
)

export default Card
