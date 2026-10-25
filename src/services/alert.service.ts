import type { QRL } from '@qwik.dev/core'
import { getLocaleFromPathname } from '~/i18n'
import i18n from './alert.i18n.json'

/**
 * Document event dispatched after load when the initial URL carries query
 * parameters, so alert handling code is only fetched when it can matter.
 */
export const URL_ALERTS_EVENT = 'url-alerts'

/**
 * Checks URL parameters for form submission flags and shows appropriate alerts
 *
 * @description This service checks URL parameters for specific flags and triggers
 * appropriate alert messages. It handles:
 * - formSubmitted: Contact form submissions
 * - newsletterSubscribed: Newsletter subscriptions
 *
 * @param location - Current location object from useLocation()
 * @param showAlert - Function to display an alert message
 */
export const checkUrlForAlerts = (
  location: URL,
  showAlert: QRL<(message: string) => void> | ((message: string) => void),
): void => {
  const t = i18n[getLocaleFromPathname(location.pathname)]
  const trigger = (message: string) => {
    const anyFn = showAlert as any
    if (anyFn && typeof anyFn.invoke === 'function') {
      // Invoke QRL lazily
      anyFn.invoke(message)
    } else if (typeof anyFn === 'function') {
      anyFn(message)
    }
  }
  // Contact form submission (preferred flag)
  if (location.searchParams.has('formSubmitted')) {
    trigger(t.formSubmitted)

    // Clean URL parameters
    const url = new URL(window.location.href)
    url.searchParams.delete('formSubmitted')
    window.history.replaceState({}, document.title, url.toString())
  }

  // Fallback: detect GET-submitted contact form (pre-hydration)
  const hasLegacyContactParams =
    location.searchParams.has('fullname') &&
    location.searchParams.has('email') &&
    location.searchParams.has('subject') &&
    location.searchParams.has('message')
  if (hasLegacyContactParams) {
    trigger(t.formSubmitted)

    // Clean all known contact params from URL and preserve hash
    const url = new URL(window.location.href)
    const legacyContactParams = [
      '_subject',
      '_captcha',
      '_format',
      '_honey',
      'fullname',
      'email',
      'subject',
      'message',
    ]

    for (const param of legacyContactParams) {
      url.searchParams.delete(param)
    }
    window.history.replaceState(
      {},
      document.title,
      url.pathname + url.search + url.hash,
    )
  }

  // Newsletter subscription
  if (location.searchParams.has('newsletterSubscribed')) {
    trigger(t.newsletterSubscribed)

    const url = new URL(window.location.href)
    url.searchParams.delete('newsletterSubscribed')
    window.history.replaceState({}, document.title, url.toString())
  }

  // Newsletter unsubscription
  if (location.searchParams.has('newsletterUnsubscribed')) {
    trigger(t.newsletterUnsubscribed)

    const url = new URL(window.location.href)
    url.searchParams.delete('newsletterUnsubscribed')
    window.history.replaceState({}, document.title, url.toString())
  }
}
