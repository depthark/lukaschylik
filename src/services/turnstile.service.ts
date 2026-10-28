import { TURNSTILE_SITE_KEY } from '~/constants/site'

const SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const CONTAINER_ID = 'turnstile-widget'

/**
 * Subset of the Turnstile browser API used here.
 * @see https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 */
interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  execute: (widgetId: string) => void
  reset: (widgetId: string) => void
}

type TurnstileWindow = Window & { turnstile?: TurnstileApi }

let scriptPromise: Promise<TurnstileApi> | null = null

/**
 * Loads the Turnstile script once, on demand.
 */
const loadScript = (): Promise<TurnstileApi> => {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.addEventListener('load', () => {
      const api = (window as TurnstileWindow).turnstile
      if (api) resolve(api)
      else reject(new Error('Turnstile unavailable'))
    })
    script.addEventListener('error', () => {
      scriptPromise = null
      reject(new Error('Turnstile failed to load'))
    })
    document.head.append(script)
  })
  return scriptPromise
}

/**
 * Returns the widget container: inside the contact form when present, so an
 * interactive challenge appears next to the fields, otherwise a fixed box.
 */
const getContainer = (): HTMLElement => {
  const existing = document.getElementById(CONTAINER_ID)
  if (existing) return existing
  const container = document.createElement('div')
  container.id = CONTAINER_ID
  container.style.cssText =
    'position:fixed;bottom:16px;left:16px;z-index:2147483000'
  document.body.append(container)
  return container
}

/**
 * Starts downloading Turnstile ahead of the first submission (e.g. when the
 * visitor focuses the form), keeping it off the initial page load.
 */
export const preloadTurnstile = () => {
  loadScript().catch(() => undefined)
}

/**
 * Runs a Turnstile challenge and resolves with a single-use token. Most
 * visitors never see anything; suspicious traffic gets an interactive check.
 */
export const getTurnstileToken = async (): Promise<string> => {
  const api = await loadScript()
  const container = getContainer()
  container.replaceChildren()
  return new Promise((resolve, reject) => {
    const widgetId = api.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      appearance: 'interaction-only',
      execution: 'execute',
      callback: (token: string) => resolve(token),
      'error-callback': () => reject(new Error('Turnstile challenge failed')),
      'expired-callback': () => api.reset(widgetId),
    })
    api.execute(widgetId)
  })
}
