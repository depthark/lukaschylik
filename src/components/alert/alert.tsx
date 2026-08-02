import { $, component$, isBrowser, useSignal, useTask$ } from '@qwik.dev/core'
import { cls } from '~/utils'
import { Icon } from '../icon'
import type { AlertProps } from './alert.types'

const Alert = component$<AlertProps>(
  ({ message, visible, onClose$, duration = 5, className }) => {
    const isVisible = useSignal(visible)

    const animationDuration = `${duration}s`

    // Keep internal visibility in sync with prop changes
    useTask$(({ track }) => {
      track(() => visible)
      isVisible.value = visible
    })

    // Auto-hide when becoming visible
    useTask$(({ track, cleanup }) => {
      track(() => isVisible.value)
      if (!isBrowser) return
      if (isVisible.value) {
        const timer = setTimeout(() => {
          isVisible.value = false
          onClose$?.()
        }, duration * 1000)
        cleanup(() => clearTimeout(timer))
      }
    })

    const handleClose = $(() => {
      isVisible.value = false
      onClose$?.()
    })

    if (!isVisible.value) {
      return null
    }

    return (
      <div
        class={cls(
          'fixed overflow-hidden',
          'flex items-start gap-3',
          'w-[min(calc(100vw-2rem),20rem)] max-w-[320px]',
          'p-4 pr-3 rounded-xl',
          'border border-white/15',
          'backdrop-blur-xl bg-green-600/72 text-white',
          'shadow-2xl shadow-black/25',
          'bottom-4 right-4',
          'sm:bottom-6 sm:right-6',
          'z-[500]',
          className,
        )}>
        <div
          class="alert-progress absolute top-0 left-0 h-1 bg-green-950/80 origin-left w-full"
          style={`--alert_duration: ${animationDuration}`}></div>
        <div class="min-w-0 flex-1 text-sm leading-relaxed text-white/95">
          {message}
        </div>
        <button
          type="button"
          onClick$={handleClose}
          class="mt-0.5 shrink-0 rounded-full p-1 text-white/90 hover:bg-white/10 hover:text-white focus:outline-none cursor-pointer transition-colors duration-200"
          aria-label="Close alert">
          <Icon name="close" cls={'w-4'} />
        </button>
      </div>
    )
  },
)

export default Alert
