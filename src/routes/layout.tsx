import {
  $,
  component$,
  Slot,
  useContextProvider,
  useOn,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from '@qwik.dev/core'
import type { DocumentHead, RequestHandler } from '@qwik.dev/router'
import { useLocation } from '@qwik.dev/router'
import { Alert, Navigation, ReservationDialog } from '~/components'
import CookieConsent from '~/components/cookie-consent/cookie-consent'
import Social from '~/components/social/social'
import { getLocaleFromPathname, stripLocale, useLocale } from '~/i18n'
import ui from '~/i18n/ui.json'
import { Footer, Header } from '~/sections'
import { checkUrlForAlerts } from '~/services'
import { AlertContext, type AlertMessage, DialogContext } from '~/utils'

export const onGet: RequestHandler = async ({ cacheControl, headers }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  })
  headers.set('Permissions-Policy', 'picture-in-picture=*, fullscreen=*')
}

/**
 * Default head metadata for all routes
 * This includes the Google Tag Manager script and structured data
 */
export const head: DocumentHead = ({ url }) => {
  const locale = getLocaleFromPathname(url.pathname)
  const meta = ui[locale].siteMeta

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
        key: 'consent-restore',
        script: `try{var k='cookie-consent-v1';var raw=localStorage.getItem(k);if(raw){var parsed=JSON.parse(raw);var v=parsed.analytics?'granted':'denied';window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};gtag('consent','update',{ad_storage:v,ad_user_data:v,ad_personalization:v,analytics_storage:v});}}catch(e){}`,
      },
      {
        key: 'gtm',
        script: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KQFH8PWL');`,
        props: {
          async: true,
        },
      },
      {
        key: 'structuredData',
        script: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Person',
              '@id': '#person',
              name: 'Lukáš Chylík',
              jobTitle: 'Frontend developer',
              email: 'chylik.lukas@gmail.com',
              telephone: '+421721459889',
              image: './images/profile/me.webp',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Hybešova 308/61',
                addressLocality: 'Brno',
                postalCode: '602 00',
                addressCountry:
                  locale === 'sk' ? 'Česká republika' : 'Czech Republic',
              },
              sameAs: ['mailto:chylik.lukas@gmail.com'],
            },
            {
              '@type': 'WebSite',
              '@id': '#website',
              url: 'https://lukaschylik.dev/',
              name: meta.defaultTitle,
              description: meta.defaultDescription,
              publisher: { '@id': '#person' },
            },
            {
              '@type': 'ProfilePage',
              '@id': '#webpage',
              url: 'https://lukaschylik.dev/',
              name: meta.defaultTitle,
              description: meta.defaultDescription,
              about: { '@id': '#person' },
              mainEntity: { '@id': '#person' },
              isPartOf: { '@id': '#website' },
              inLanguage: locale,
            },
          ],
        }),
        props: {
          type: 'application/ld+json',
        },
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
  const clientReady = useSignal(false)

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

  useOn(
    'qvisible',
    $(() => {
      clientReady.value = true
    }),
  )

  // Check for URL parameters on initial load
  useTask$(({ track }) => {
    // React to URL changes (e.g., query params added by client-side navigation)
    track(() => location.url.href)
    track(() => clientReady.value)
    if (!clientReady.value) return

    // Use the alert service to check for URL parameters and show appropriate alerts
    const showAlertFn = $((message: string) => {
      alertState.text = message
      alertState.visible = true
    })

    checkUrlForAlerts(location.url, showAlertFn)
  })

  // Disable smooth scroll only when navigating forward into a blog article
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const navigating = track(() => location.isNavigating)
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
