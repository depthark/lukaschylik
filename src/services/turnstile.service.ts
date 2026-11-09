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
 * Turnstile tokens are single-use and expire after 300 s; reuse a prefetched
 * one only while it is comfortably younger than that.
 */
const TOKEN_MAX_AGE_MS = 240_000

/** A challenge started ahead of the submission, waiting to be used. */
let prefetched: { token: Promise<string>; startedAt: number } | null = null

/**
 * Runs a Turnstile challenge and resolves with a single-use token. Most
 * visitors never see anything; suspicious traffic gets an interactive check.
 */
const runChallenge = async (): Promise<string> => {
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

/**
 * Starts the "verify you are human" check as soon as the visitor begins to fill
 * in the form (also downloads the Turnstile script then, keeping it off the
 * initial page load). When Send is pressed the token is already there, and a
 * visitor who gets an interactive challenge solves it while typing instead of
 * being interrupted mid-submit. Safe to call repeatedly.
 */
export const prefetchTurnstileToken = () => {
  if (prefetched && Date.now() - prefetched.startedAt < TOKEN_MAX_AGE_MS) return
  const entry = { token: runChallenge(), startedAt: Date.now() }
  prefetched = entry
  // A failed early attempt is dropped; sending then runs a fresh challenge.
  entry.token.catch(() => {
    if (prefetched === entry) prefetched = null
  })
}

/**
 * Returns the token for the submission: the prefetched one when it is still
 * fresh, otherwise a new challenge (e.g. WebMCP agents never focus the form).
 * Tokens are single-use, so the prefetched one is consumed.
 */
export const getTurnstileToken = (): Promise<string> => {
  const entry = prefetched
  prefetched = null
  if (entry && Date.now() - entry.startedAt < TOKEN_MAX_AGE_MS) {
    return entry.token.catch(() => runChallenge())
  }
  return runChallenge()
}
