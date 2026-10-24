import type { Locale } from '~/i18n'
import type * as Game from './game'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]
const GAME_URL = '/easter-egg/bug-squasher.js'
const TAPS_NEEDED = 5
const TAP_WINDOW_MS = 1500

let konamiIndex = 0
let taps: number[] = []

/**
 * Loads the game on demand and starts a round. Production loads the
 * standalone build from `easter-egg:build`, which stays outside the Qwik
 * bundle graph so the preloader never fetches it ahead of time.
 * @param locale - Active site locale
 */
const launch = async (locale: Locale) => {
  const { startGame }: typeof Game = import.meta.env.DEV
    ? await import('./game')
    : await import(/* @vite-ignore */ GAME_URL)
  startGame(locale)
}

/**
 * Feeds a pressed key into the Konami code matcher and launches
 * the game once the full sequence has been typed.
 * @param key - `KeyboardEvent.key` of the pressed key
 * @param locale - Active site locale
 */
export const trackKonami = (key: string, locale: Locale) => {
  const normalized = key.length === 1 ? key.toLowerCase() : key
  if (normalized !== KONAMI[konamiIndex]) {
    konamiIndex = normalized === KONAMI[0] ? 1 : 0
    return
  }
  konamiIndex += 1
  if (konamiIndex < KONAMI.length) return
  konamiIndex = 0
  launch(locale)
}

/**
 * Counts quick taps on an element, giving it a small wiggle as a hint,
 * and launches the game after enough taps in a short window.
 * @param el - Tapped element
 * @param locale - Active site locale
 */
export const trackTap = (el: HTMLElement, locale: Locale) => {
  const now = Date.now()
  taps = [...taps.filter((time) => now - time < TAP_WINDOW_MS), now]
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.animate(
      [
        { rotate: '0deg' },
        { rotate: `${taps.length % 2 ? 3 : -3}deg` },
        { rotate: '0deg' },
      ],
      { duration: 220, easing: 'ease-out' },
    )
  }
  if (taps.length < TAPS_NEEDED) return
  taps = []
  launch(locale)
}
