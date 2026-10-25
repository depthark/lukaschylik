import { component$, useStyles$ } from '@qwik.dev/core'
import { isDev } from '@qwik.dev/core/build'
import {
  RouterOutlet,
  ServiceWorkerRegister,
  useQwikRouter,
} from '@qwik.dev/router'
import { RouterHead } from './components/router-head/router-head'
import { THEME_INIT_SCRIPT } from './utils'
import siteStyles from './styles/scss/index.scss?inline'
import tailwindStyles from './styles/css/tailwind.css?inline'

const STYLES = (siteStyles + tailwindStyles).replaceAll('@charset "UTF-8";', '')

/**
 * Root component of the application. Initializes Qwik Router via the
 * `useQwikRouter()` hook (Qwik 2 API), immediately followed by the
 * document's `<head>` and `<body>`.
 *
 * All CSS is inlined into the document head, so the first paint needs no
 * extra render-blocking request.
 *
 * Don't remove the `<head>` and `<body>` elements.
 */
export default component$(() => {
  useQwikRouter()
  useStyles$(STYLES)

  return (
    <>
      <head>
        <meta charset="utf-8" />
        <RouterHead />
        <script
          id="theme-init"
          dangerouslySetInnerHTML={THEME_INIT_SCRIPT}></script>
      </head>
      <body class="bg-black-900">
        <RouterOutlet />
        {!isDev && <ServiceWorkerRegister />}
      </body>
    </>
  )
})
