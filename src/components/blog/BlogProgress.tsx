import { $, component$, useOnWindow, useSignal } from '@qwik.dev/core'
import { supportsScrollTimeline } from '~/utils'

let ticking = false

/**
 * Blog progress component that shows reading progress at the top of the page.
 * Uses CSS scroll-driven animations; the JS fallback for browsers without
 * support is only downloaded on the first scroll.
 */
export const BlogProgress = component$(() => {
  const progressRef = useSignal<HTMLDivElement>()

  useOnWindow(
    'scroll',
    $(() => {
      const el = progressRef.value
      if (!el || ticking || supportsScrollTimeline()) return
      ticking = true
      el.classList.add('blog__progress--fallback')
      requestAnimationFrame(() => {
        const html = document.documentElement
        const max = html.scrollHeight - html.clientHeight
        const progress = Math.max(0, Math.min(1, html.scrollTop / max))
        el.style.scale = `${progress} 1`
        ticking = false
      })
    }),
  )

  return <div ref={progressRef} class="blog__progress" />
})
