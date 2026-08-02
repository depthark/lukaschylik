import { component$ } from '@qwik.dev/core'
import Icon from '../icon/icon'
import type { SocialItemProps } from './socialItem.types'

const SocialItem = component$<SocialItemProps>(({ href, label, icon, key }) => {
  return (
    <li
      key={key}
      class="group absolute to-50% left-50% z-10 mix-blend-difference">
      <a
        href={href}
        rel="external"
        aria-label={label}
        target="_blank"
        class="block transition-transform duration-250 ease-in-out scale-100 hover:scale-110">
        <Icon name={icon} cls="w-6 xl:w-8 text-white" />
      </a>
    </li>
  )
})

export default SocialItem
