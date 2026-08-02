import { component$ } from '@qwik.dev/core'
import { cls } from '~/utils'
import type { SkillItemProps } from './skills.types'

const SkillItem = component$<SkillItemProps>(({ text }) => {
  return (
    <li
      class={cls(
        'inline-block',
        'border border-black dark:border-white rounded-lg',
        'leading-normal text-nowrap',
        'text-sm sm:text-lg md:text-xl xl:text-2xl',
        'px-4 xl:px-8 py-2 xl:py-3 3xl:py-4',
      )}>
      {text}
    </li>
  )
})

export default SkillItem
