import { component$ } from '@qwik.dev/core'
import { isDev } from '@qwik.dev/core/build'
import {
  RouterOutlet,
  ServiceWorkerRegister,
  useQwikRouter,
} from '@qwik.dev/router'
import { RouterHead } from './components/router-head/router-head'
import { THEME_INIT_SCRIPT } from './utils'
import './styles/scss/index.scss'
import './styles/css/tailwind.css'

/**
 * Root component of the application. Initializes Qwik Router via the
 * `useQwikRouter()` hook (Qwik 2 API), immediately followed by the
 * document's `<head>` and `<body>`.
 *
 * Don't remove the `<head>` and `<body>` elements.
 */
export default component$(() => {
  useQwikRouter()

  return (
    <>
      <head>
        <meta charset="utf-8" />
        <RouterHead />
        <script
          id="theme-init"
          dangerouslySetInnerHTML={THEME_INIT_SCRIPT}></script>
        <link rel="stylesheet" href="/src/styles/css/tailwind.css" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
      </head>
      <body class="bg-black-900">
        <noscript
          dangerouslySetInnerHTML={
            '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KQFH8PWL" height="0" width="0" title="Google Tag Manager" style="display:none;visibility:hidden"></iframe>'
          }></noscript>
        <RouterOutlet />
        {!isDev && <ServiceWorkerRegister />}
      </body>
    </>
  )
})
