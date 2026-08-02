import { component$, Slot } from '@qwik.dev/core'
import { cls } from '~/utils'
import type { ListItemProps } from './listItem.types'

const ListItem = component$<ListItemProps>(
  ({ marker = '🔥', className }: ListItemProps) => {
    return (
      <li
        data-marker={marker}
        class={cls(
          'ms-5 md:ms-7 ps-2',
          className ?? 'text-sm sm:text-base md:text-md 3xl:text-lg',
          'font-bold',
        )}>
        <Slot />
      </li>
    )
  },
)

export default ListItem
