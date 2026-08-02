import { $, component$, useOn, useOnWindow, useSignal } from '@qwik.dev/core'
import { supportsScrollTimeline } from '~/utils'

/**
 * Blog progress component that shows reading progress at the top of the page
 * Uses CSS scroll-driven animations with a JS fallback for browsers without support
 */
export const BlogProgress = component$(() => {
  const progressRef = useSignal<HTMLDivElement>()
  const needsFallback = useSignal(false)
  const lastScrollPercentage = useSignal(0)
  const ticking = useSignal(false)

  // Check if browser supports scroll timeline on component mount
  useOn(
    'qvisible',
    $(() => {
      needsFallback.value = !supportsScrollTimeline()
    }),
  )

  // Optimized scroll handler with requestAnimationFrame for better performance
  useOnWindow(
    'scroll',
    $(() => {
      if (!needsFallback.value || !progressRef.value) return

      if (!ticking.value) {
        window.requestAnimationFrame(() => {
          const scrollTop =
            document.documentElement.scrollTop || document.body.scrollTop
          const scrollHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight
          const scrollPercentage = Math.max(
            0,
            Math.min(1, scrollTop / scrollHeight),
          )

          // Only update if there's a significant change (reduces unnecessary style updates)
          if (Math.abs(scrollPercentage - lastScrollPercentage.value) > 0.005) {
            progressRef.value!.style.scale = `${scrollPercentage} 1`
            lastScrollPercentage.value = scrollPercentage
          }

          ticking.value = false
        })

        ticking.value = true
      }
    }),
  )

  return (
    <div
      ref={progressRef}
      class={`blog__progress ${needsFallback.value ? 'blog__progress--fallback' : ''}`}
    />
  )
})
