import {
  $,
  component$,
  isServer,
  Slot,
  useContextProvider,
  useOnDocument,
  useOnWindow,
  useSignal,
  useStore,
  useTask$,
} from '@qwik.dev/core'
import type { DocumentHead, RequestHandler } from '@qwik.dev/router'
import { useLocation, useNavigate } from '@qwik.dev/router'
import { Alert, Navigation, ReservationDialog } from '~/components'
import { trackKonami } from '~/components/bug-squasher/trigger'
import CookieConsent from '~/components/cookie-consent/cookie-consent'
import Social from '~/components/social/social'
import { getLocaleFromPathname, stripLocale, useLocale } from '~/i18n'
import ui from '~/i18n/ui.json'
import { Footer, Header } from '~/sections'
import { checkUrlForAlerts, URL_ALERTS_EVENT } from '~/services'
import { AlertContext, type AlertMessage, DialogContext } from '~/utils'
import { useWebMcp, WEBMCP_DETECT_SCRIPT } from '~/webmcp'

export const onGet: RequestHandler = async ({ cacheControl, headers }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  })
  headers.set('Permissions-Policy', 'picture-in-picture=*, fullscreen=*')
}

/**
 * Default head metadata for all routes
 * Consent mode bootstrap, deferred Google Tag Manager loader and lazy signals
 */
export const head: DocumentHead = ({ url }) => {
  const locale = getLocaleFromPathname(url.pathname)

  return {
    scripts: [
      {
        key: 'consent-defaults',
        script:
          "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:1000});",
        props: {
          async: true,
        },
      },
      {
        key: 'consent-init',
        script: `(function(w,d){var h=d.documentElement;w.__loadGtm=function(){if(w.__gtmLoaded)return;w.__gtmLoaded=1;w.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});var s=d.createElement('script');s.async=1;s.src='https://www.googletagmanager.com/gtm.js?id=GTM-KQFH8PWL';d.head.appendChild(s)};try{var p=JSON.parse(localStorage.getItem('cookie-consent-v1')||'null');if(!p||typeof p.analytics!=='boolean'){h.dataset.consent='pending';return}var v=p.analytics?'granted':'denied';gtag('consent','update',{ad_storage:v,ad_user_data:v,ad_personalization:v,analytics_storage:v});if(!p.analytics)return;if(d.readyState==='complete')w.__loadGtm();else w.addEventListener('load',function(){setTimeout(w.__loadGtm,0)})}catch(e){h.dataset.consent='pending'}})(window,document)`,
      },
      {
        key: 'deferred-signals',
        script: `if(location.search)addEventListener('load',function(){document.dispatchEvent(new Event('${URL_ALERTS_EVENT}'))});${WEBMCP_DETECT_SCRIPT}`,
      },
      {
        key: 'easter-egg-hint',
        script: `console.log(${JSON.stringify(`%c${ui[locale].easterEgg.consoleHint}`)},'font:600 13px/1.6 monospace;color:#a855f7')`,
      },
    ],
  }
}

export default component$(() => {
  const location = useLocation()
  const locale = useLocale()
  const navLabels = ui[locale].nav

  // Create alert store
  const alertState = useStore<AlertMessage>({
    text: '',
    visible: false,
  })

  // Create dialog ref for global reservation dialog
  const dialogRef = useSignal<HTMLDialogElement>()

  // Provide alert context
  useContextProvider(AlertContext, {
    alertMessage: alertState,
    showAlert: $((message: string) => {
      alertState.text = message
      alertState.visible = true
    }),
    hideAlert: $(() => {
      alertState.visible = false
    }),
  })

  // Provide dialog context
  useContextProvider(DialogContext, {
    dialogRef,
    showDialog: $(() => {
      dialogRef.value?.showModal()
    }),
    hideDialog: $(() => {
      dialogRef.value?.close()
    }),
  })

  const nav = useNavigate()

  useWebMcp({
    navigate: $((path: string) => nav(path)),
    openBooking: $(() => {
      dialogRef.value?.showModal()
    }),
    showAlert: $((message: string) => {
      alertState.text = message
      alertState.visible = true
    }),
  })

  useOnWindow(
    'keydown',
    $((event: KeyboardEvent) => trackKonami(event.key, locale)),
  )

  const showUrlAlert = $((message: string) => {
    alertState.text = message
    alertState.visible = true
  })

  useOnDocument(
    URL_ALERTS_EVENT,
    $(() => checkUrlForAlerts(new URL(window.location.href), showUrlAlert)),
  )

  // Check for URL parameters after client-side navigation
  useTask$(({ track }) => {
    track(() => location.url.href)
    if (isServer || !location.url.search) return
    checkUrlForAlerts(location.url, showUrlAlert)
  })

  // Disable smooth scroll only when navigating forward into a blog article
  useTask$(({ track }) => {
    const navigating = track(() => location.isNavigating)
    if (isServer) return
    const pathname = stripLocale(location.url.pathname)
    const goingToArticle =
      pathname.startsWith('/blog/') && pathname !== '/blog/'

    if (navigating && goingToArticle) {
      document.documentElement.style.scrollBehavior = 'auto'
    } else {
      document.documentElement.style.scrollBehavior = ''
    }
  })

  // Check if we're on the homepage
  const isHomePage = stripLocale(location.url.pathname) === '/'

  // Check if we're on a blog post page
  const isBlogPostPage = stripLocale(location.url.pathname).startsWith(
    '/blog/articles/',
  )

  // Handle alert close
  const handleAlertClose = $(() => {
    alertState.visible = false
  })

  return (
    <>
      <CookieConsent />
      <Navigation
        links={[
          {
            href: '/#about-me',
            text: navLabels.about,
          },
          {
            href: '/#references',
            text: navLabels.references,
          },
          {
            href: '/#services',
            text: navLabels.services,
          },
          {
            href: '/#contact',
            text: navLabels.contact,
          },
          {
            href: '/sessions/',
            text: navLabels.sessions,
          },
          {
            href: '/blog/',
            text: navLabels.blog,
          },
        ]}
      />
      {isHomePage && <Header />}
      <main>
        <Alert
          message={alertState.text}
          visible={alertState.visible}
          onClose$={handleAlertClose}
          duration={5}
        />
        <Slot />
        {!isBlogPostPage && <Social />}
      </main>
      <Footer />
      <ReservationDialog dialogRef={dialogRef} />
    </>
  )
})
