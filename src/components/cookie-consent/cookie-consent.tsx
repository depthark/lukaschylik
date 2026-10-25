import { $, component$, useOnDocument, useSignal } from '@qwik.dev/core'
import { Button, Container } from '~/components'
import { useLocale } from '~/i18n'
import i18n from './cookie-consent.i18n.json'
import { OPEN_COOKIE_PREFERENCES } from './cookie-consent.events'

/**
 * Stored cookie consent choice.
 */
type ConsentPrefs = {
  analytics: boolean
}

/**
 * Window extended with the Google consent helpers defined by the inline
 * head scripts in `layout.tsx`.
 */
type ConsentWindow = Window & {
  gtag?: (...args: unknown[]) => void
  __loadGtm?: () => void
}

const STORAGE_KEY = 'cookie-consent-v1'

/**
 * Reads the stored consent choice, tolerating blocked or corrupted storage.
 */
const readPrefs = (): ConsentPrefs | null => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return typeof parsed?.analytics === 'boolean'
      ? { analytics: parsed.analytics }
      : null
  } catch {
    return null
  }
}

/**
 * Stores the consent choice, ignoring blocked storage.
 * @param prefs - Consent choice to persist
 */
const persistPrefs = (prefs: ConsentPrefs) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...prefs, ts: Date.now() }),
    )
  } catch {
    return
  }
}

/**
 * Persists the choice, updates Google consent mode, loads Google Tag Manager
 * only after analytics was granted and hides the banner.
 * @param prefs - Consent choice made by the visitor
 */
const applyConsent = (prefs: ConsentPrefs) => {
  const w = window as ConsentWindow
  const value = prefs.analytics ? 'granted' : 'denied'
  persistPrefs(prefs)
  w.gtag?.('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  })
  if (prefs.analytics) w.__loadGtm?.()
  delete document.documentElement.dataset.consent
}

/**
 * Cookie consent banner and preferences dialog.
 *
 * The banner is server-rendered and shown purely by CSS while
 * `<html data-consent="pending">` is set by the inline head script, so it
 * paints with the page and needs no JavaScript until the visitor interacts.
 */
export default component$(() => {
  const t = i18n[useLocale()]
  const prefsDialogRef = useSignal<HTMLDialogElement>()
  const analytics = useSignal(false)

  const openPreferences = $(() => {
    analytics.value = readPrefs()?.analytics ?? false
    prefsDialogRef.value?.showModal()
  })

  const choose = $((prefs: ConsentPrefs) => {
    analytics.value = prefs.analytics
    applyConsent(prefs)
    prefsDialogRef.value?.close()
  })

  useOnDocument(OPEN_COOKIE_PREFERENCES, openPreferences)

  return (
    <>
      <div
        role="region"
        aria-label={t.banner.title}
        class="hidden [:root[data-consent=pending]_&]:block fixed inset-x-0 bottom-0 z-[300] [color-scheme:dark]">
        <div class="relative bg-neutral-900/95 border-t border-neutral-800 text-neutral-100">
          <Container size="md" className="py-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p class="text-sm leading-relaxed text-neutral-300">
                <strong class="text-neutral-100">{t.banner.title}</strong>
                <span class="mx-2" aria-hidden="true">
                  —
                </span>
                {t.banner.description}
              </p>
              <div class="flex flex-wrap gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="primary"
                  title={t.banner.deny}
                  onClick$={() => choose({ analytics: false })}>
                  {t.banner.deny}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  title={t.banner.settings}
                  onClick$={openPreferences}>
                  {t.banner.settings}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  title={t.banner.acceptAll}
                  onClick$={() => choose({ analytics: true })}>
                  {t.banner.acceptAll}
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </div>

      <dialog
        ref={prefsDialogRef}
        aria-labelledby="cookie-dialog-title"
        class="[color-scheme:dark] bg-neutral-900 text-neutral-100 w-[min(92vw,640px)] max-w-[92vw] md:max-w-[640px] rounded-xl border border-neutral-800 p-0 mx-auto my-auto">
        <div class="p-5 md:p-6 border-b border-neutral-800">
          <h2 id="cookie-dialog-title" class="text-lg font-semibold">
            {t.dialog.title}
          </h2>
          <p class="mt-1 text-sm text-neutral-300">{t.dialog.description}</p>
        </div>
        <div class="p-5 md:p-6 flex flex-col gap-4">
          <div class="flex items-start gap-3">
            <input
              id="necessary"
              type="checkbox"
              checked
              disabled
              class="mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-800"
            />
            <div class="text-sm">
              <label for="necessary" class="font-medium text-neutral-100">
                {t.dialog.necessaryLabel}
              </label>
              <p class="text-neutral-300">{t.dialog.necessaryDescription}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <input
              id="analytics"
              type="checkbox"
              checked={analytics.value}
              onInput$={(_, el) => {
                analytics.value = el.checked
              }}
              class="mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-800"
            />
            <div class="text-sm">
              <label for="analytics" class="font-medium text-neutral-100">
                {t.dialog.analyticsLabel}
              </label>
              <p class="text-neutral-300">{t.dialog.analyticsDescription}</p>
            </div>
          </div>
        </div>
        <div class="p-5 md:p-6 flex flex-wrap items-center justify-end gap-2 border-t border-neutral-800">
          <Button
            size="sm"
            variant="secondary"
            title={t.dialog.close}
            onClick$={() => prefsDialogRef.value?.close()}>
            {t.dialog.close}
          </Button>
          <Button
            size="sm"
            variant="primary"
            title={t.dialog.denyAll}
            onClick$={() => choose({ analytics: false })}>
            {t.dialog.denyAll}
          </Button>
          <Button
            size="sm"
            variant="primary"
            title={t.dialog.save}
            onClick$={() => choose({ analytics: analytics.value })}>
            {t.dialog.save}
          </Button>
        </div>
      </dialog>
    </>
  )
})
