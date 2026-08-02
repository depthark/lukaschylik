import { component$ } from '@qwik.dev/core'
import { useLocation } from '@qwik.dev/router'
import { getLocaleFromPathname, localizePath } from '~/i18n'
import ui from '~/i18n/ui.json'

/**
 * Slovak flag rendered as a circular chip (white/blue/red stripes with the
 * double-cross coat of arms).
 */
const FlagSk = () => (
  <svg
    viewBox="0 0 640 480"
    preserveAspectRatio="xMidYMid slice"
    class="w-full h-full"
    aria-hidden="true">
    <path fill="#fff" d="M0 0h640v160H0z" />
    <path fill="#0b4ea2" d="M0 160h640v160H0z" />
    <path fill="#ee1c25" d="M0 320h640v160H0z" />
    <path
      fill="#ee1c25"
      stroke="#fff"
      stroke-width="14"
      d="M140 110h200v150c0 66-44 106-100 128-56-22-100-62-100-128z"
    />
    <path
      fill="#fff"
      d="M222 150h36v42h44v32h-44v42h44v32h-44v70h-36v-70h-44v-32h44v-42h-44v-32h44z"
    />
    <path
      fill="#0b4ea2"
      d="M162 330c22-26 44-28 66-12 16-24 44-24 60 0 22-16 44-14 66 12-10 40-52 66-96 82-44-16-86-42-96-82z"
    />
  </svg>
)

/**
 * United Kingdom flag rendered as a circular chip (Union Jack).
 */
const FlagGb = () => (
  <svg
    viewBox="0 0 640 480"
    preserveAspectRatio="xMidYMid slice"
    class="w-full h-full"
    aria-hidden="true">
    <path fill="#012169" d="M0 0h640v480H0z" />
    <path
      fill="#fff"
      d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"
    />
    <path
      fill="#c8102e"
      d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"
    />
    <path fill="#fff" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
    <path fill="#c8102e" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
  </svg>
)

/**
 * Language toggle rendered as a link to the current page in the other locale.
 * Shows the flag of the language the visitor can switch to. Uses a plain
 * anchor because each locale is a separately generated static document.
 */
const LanguageSwitch = component$(() => {
  const location = useLocation()
  const locale = getLocaleFromPathname(location.url.pathname)
  const target = locale === 'sk' ? 'en' : 'sk'
  const t = ui[locale].languageSwitch
  const href = localizePath(location.url.pathname, target)

  return (
    <a
      href={href}
      hreflang={target}
      rel="alternate"
      aria-label={t.label}
      title={t.label}
      class="inline-grid place-items-center w-6 h-6 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 transition-opacity duration-200 opacity-100 hover:opacity-80">
      {target === 'en' ? <FlagGb /> : <FlagSk />}
    </a>
  )
})

export default LanguageSwitch
