import { $, component$, useOnDocument, useSignal } from '@qwik.dev/core'
import { Button, Container } from '~/components'
import { useLocale } from '~/i18n'
import i18n from './cookie-consent.i18n.json'

type ConsentPrefs = {
  analytics: boolean
}

const STORAGE_KEY = 'cookie-consent-v1'

const readPrefs = (): ConsentPrefs | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.analytics === 'boolean') {
      return { analytics: parsed.analytics } as ConsentPrefs
    }
    return null
  } catch {
    return null
  }
}

const persistPrefs = (prefs: ConsentPrefs) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...prefs, ts: Date.now() }),
    )
  } catch {}
}

export default component$(() => {
  const t = i18n[useLocale()]
  const showBanner = useSignal(false)
  const prefsDialogRef = useSignal<HTMLDialogElement>()
  const analytics = useSignal(false)

  const applyConsent = $((prefs: ConsentPrefs) => {
    if (typeof window === 'undefined') return
    const w = window as any
    const gtag = w.gtag || ((...args: any[]) => w.dataLayer?.push(args))
    const value = prefs.analytics ? 'granted' : 'denied'
    const update = {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    } as const
    try {
      gtag('consent', 'update', update)
    } catch {}
  })

  const acceptAll = $(async () => {
    analytics.value = true
    const prefs = { analytics: true }
    persistPrefs(prefs)
    await applyConsent(prefs)
    showBanner.value = false
    prefsDialogRef.value?.close()
  })

  const denyAll = $(async () => {
    analytics.value = false
    const prefs = { analytics: false }
    persistPrefs(prefs)
    await applyConsent(prefs)
    showBanner.value = false
    prefsDialogRef.value?.close()
  })

  const savePrefs = $(async () => {
    const prefs = { analytics: analytics.value }
    persistPrefs(prefs)
    await applyConsent(prefs)
    showBanner.value = false
    prefsDialogRef.value?.close()
  })

  useOnDocument(
    'qinit',
    $(() => {
      ;(window as any).__openCookiePreferences = () => {
        const stored = readPrefs()
        if (!stored) {
          showBanner.value = true
        }
        prefsDialogRef.value?.showModal()
      }

      const stored = readPrefs()
      if (stored) {
        analytics.value = stored.analytics
        // Re-apply consent on hydration (no-op if already applied)
        void applyConsent(stored)
        showBanner.value = false
        return
      }

      showBanner.value = true
    }),
  )

  return (
    <>
      {showBanner.value && (
        <div class="fixed inset-x-0 bottom-0 z-[300]">
          <div class="relative bg-neutral-900/95 border-t border-neutral-800 text-neutral-100">
            <Container size="md" className="py-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="text-sm leading-relaxed text-neutral-300">
                  <strong class="text-neutral-100">{t.banner.title}</strong>
                  <span class="mx-2">—</span>
                  {t.banner.description}
                </div>
                <div class="flex gap-2 shrink-0">
                  <Button size="sm" variant="primary" onClick$={denyAll}>
                    {t.banner.deny}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick$={() => {
                      const stored = readPrefs()
                      if (!stored) {
                        showBanner.value = true
                      }
                      prefsDialogRef.value?.showModal()
                    }}>
                    {t.banner.settings}
                  </Button>
                  <Button size="sm" variant="primary" onClick$={acceptAll}>
                    {t.banner.acceptAll}
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        </div>
      )}

      <dialog
        ref={prefsDialogRef}
        class="bg-neutral-900 text-neutral-100 w-[min(92vw,640px)] max-w-[92vw] md:max-w-[640px] rounded-xl border border-neutral-800 p-0 mx-auto my-auto">
        <div class="p-5 md:p-6 border-b border-neutral-800">
          <h2 class="text-lg font-semibold">{t.dialog.title}</h2>
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
              onInput$={(event) => {
                analytics.value = (event.target as HTMLInputElement).checked
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
        <div class="p-5 md:p-6 flex items-center justify-end gap-2 border-t border-neutral-800">
          <Button
            size="sm"
            variant="secondary"
            onClick$={() => prefsDialogRef.value?.close()}>
            {t.dialog.close}
          </Button>
          <Button size="sm" variant="primary" onClick$={denyAll}>
            {t.dialog.denyAll}
          </Button>
          <Button size="sm" variant="primary" onClick$={savePrefs}>
            {t.dialog.save}
          </Button>
        </div>
      </dialog>
    </>
  )
})
