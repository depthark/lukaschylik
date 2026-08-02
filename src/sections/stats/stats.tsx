import {
  $,
  component$,
  useOn,
  useSignal,
  useStore,
  useTask$,
} from '@qwik.dev/core'
import { Container, Section } from '~/components'
import { cls } from '~/utils'

const STATS = [
  { value: 10, suffix: '+', label: 'rokov praxe' },
  {
    value: 100,
    suffix: '+',
    label: 'úspešne dokončených projektov',
    glowing: true,
  },
  { value: 50, suffix: '+', label: 'spokojných zákazníkov' },
]

const Stats = component$(() => {
  const state = useStore({
    values: STATS.map(() => 0),
    hasAnimated: false,
  })
  const startAnimation = useSignal(false)

  useOn(
    'qvisible',
    $(() => {
      startAnimation.value = true
    }),
  )

  useTask$(({ track, cleanup }) => {
    track(() => startAnimation.value)
    if (!startAnimation.value) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let rafId = 0
    let observer: IntersectionObserver | null = null

    const runAnimation = () => {
      if (state.hasAnimated) return
      state.hasAnimated = true

      if (prefersReduced) {
        STATS.forEach((stat, index) => {
          state.values[index] = stat.value
        })
        return
      }

      const durationMs = 1200
      const start = performance.now()

      const step = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1)
        const eased = 1 - (1 - progress) ** 3

        STATS.forEach((stat, index) => {
          state.values[index] = Math.round(stat.value * eased)
        })

        if (progress < 1) {
          rafId = requestAnimationFrame(step)
        }
      }

      rafId = requestAnimationFrame(step)
    }

    const section = document.querySelector('#stats')
    if (!section) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          runAnimation()
          observer?.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    observer.observe(section)

    cleanup(() => {
      if (observer) observer.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    })
  })

  return (
    <Section id="stats" fullHeight={false}>
      <Container size="full" className="relative z-10 isolate">
        <div class="stats grid grid-cols-1 md:grid-cols-3 text-white gap-6 md:gap-12">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              class="content-fade-in content-fade-in--entry content-center ">
              <div
                class={cls(
                  'stat-card overflow-clip',
                  'group relative',
                  'grid place-items-center',
                  'border-2 border-black dark:border-white rounded-lg',
                  'text-black dark:text-white',
                  'bg-white dark:bg-black',
                  'p-8 sm:p-10',
                  'aspect-video',
                  stat.glowing && 'card stat-card--glow',
                )}>
                <div class="grid gap-4 place-items-center text-center">
                  <div
                    class={cls(
                      'text-6xl sm:text-6xl md:text-7xl lg:text-8xl 2xl:text-8xl font-bold font-mono tracking-wide text-pretty',
                      stat.glowing
                        ? 'text-yellow-500'
                        : 'text-black dark:text-white',
                    )}>
                    {state.values[index]}
                    {stat.suffix}
                  </div>
                  <p class="text-lg md:text-xl lg:text-2xl 2xl:text-2xl 3xl:text-3xl leading-relaxed font-light text-gray-800 dark:text-gray-300 font-mono">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
})

export default Stats
