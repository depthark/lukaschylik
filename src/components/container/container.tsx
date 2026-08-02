import { component$, Slot } from '@qwik.dev/core'
import { cls } from '~/utils'
import type { ContainerProps } from './container.types'

const Container = component$<ContainerProps>(({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-[min(calc(100%-10svi),calc(1024px-2rem))]',
    md: 'w-[min(calc(100%-10svi),calc(1440px-2rem))]',
    lg: 'w-[min(calc(100%-10svi),calc(1920px-2rem))]',
    full: 'w-[calc(100%-10svi)]',
    blog: 'w-[min(calc(100%-10svi),85ch)]',
  }

  return (
    <div class={cls('mx-auto relative isolate', sizeClasses[size], className)}>
      <Slot />
    </div>
  )
})

export default Container
