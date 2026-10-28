import { CONTACT_EMAIL } from '../../src/constants/business'
import { SITE_OWNER } from '../../src/constants/site'
import { getLocaleFromPathname, type Locale } from '../../src/i18n/core'
import i18n from '../../src/sections/contact/contact.i18n.json'

/**
 * Pages Function environment (Pages → Settings → Variables and Secrets).
 */
interface Env {
  /** Resend API key with sending access only (secret) */
  RESEND_API_KEY?: string
  /** Optional sender, defaults to {@link DEFAULT_FROM}; the domain must be verified in Resend */
  CONTACT_FROM?: string
  /** Optional comma-separated recipients, defaults to {@link CONTACT_EMAIL} */
  CONTACT_TO?: string
  /** Cloudflare Turnstile secret key (secret); when set, a valid token is required */
  TURNSTILE_SECRET_KEY?: string
}

/**
 * Subset of the Pages Function context used here.
 */
interface Context {
  request: Request
  env: Env
}

/**
 * Normalized contact form submission.
 */
type Submission = Record<
  | 'fullname'
  | 'email'
  | 'subject'
  | 'message'
  | 'botcheck'
  | 'elapsed'
  | 'token',
  string
> & { locale: Locale }

/**
 * Result reported back to the visitor.
 */
type Outcome = { ok: true } | { error: string; status: number }

const RESEND_URL = 'https://api.resend.com/emails'
const DEFAULT_FROM = `${SITE_OWNER} <web@lukaschylik.dev>`
const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const MIN_FILL_MS = 3000
const MAX_LINKS = 2
const FOREIGN_SCRIPT = /[\u0400-\u04ff\u0600-\u06ff\u3040-\u30ff\u4e00-\u9fff]/
const EMAIL_PATTERN = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/
const LIMITS = { fullname: 120, email: 200, subject: 200, message: 5000 }

/**
 * Escapes text for HTML e-mail bodies.
 * @param text - Raw text
 */
const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

/**
 * Replaces `{key}` placeholders in a template.
 * @param template - Text with placeholders
 * @param values - Placeholder values
 */
const format = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')

/**
 * Reads a JSON (script) or form (no-JS) submission.
 * @param request - Incoming request
 * @param viaScript - Whether the body is JSON
 */
const readSubmission = async (
  request: Request,
  viaScript: boolean,
): Promise<Submission> => {
  const raw: Record<string, unknown> = viaScript
    ? await request.json()
    : Object.fromEntries(await request.formData())
  const field = (...keys: string[]) =>
    keys.map((key) => String(raw[key] ?? '').trim()).find(Boolean) ?? ''
  const locale = field('locale')
  return {
    fullname: field('fullname', 'name'),
    email: field('email'),
    subject: field('subject', 'user_subject'),
    message: field('message'),
    botcheck: field('botcheck'),
    elapsed: field('elapsed'),
    token: field('turnstile', 'cf-turnstile-response'),
    locale:
      locale === 'en' || locale === 'sk'
        ? locale
        : getLocaleFromPathname(
            new URL(request.headers.get('Referer') ?? request.url).pathname,
          ),
  }
}

/**
 * Returns a visitor-facing validation error, or null when the input is valid.
 * @param data - Submission
 */
const validate = (data: Submission): string | null => {
  const t = i18n[data.locale].mail
  if (!data.fullname || !data.email || !data.subject || !data.message) {
    return t.invalid
  }
  if (!EMAIL_PATTERN.test(data.email)) return t.invalidEmail
  const tooLong = Object.entries(LIMITS).some(
    ([key, max]) => data[key as keyof typeof LIMITS].length > max,
  )
  return tooLong ? t.tooLong : null
}

/**
 * Honeypot, time on page, link count and non-Latin scripts (the site is
 * Slovak and English). True means "a bot, drop it silently".
 * @param data - Submission
 */
const looksLikeSpam = (data: Submission) => {
  const text = `${data.fullname} ${data.subject} ${data.message}`
  const links = text.match(/https?:\/\/|www\./gi)?.length ?? 0
  const tooFast = !(Number(data.elapsed) >= MIN_FILL_MS)
  return (
    Boolean(data.botcheck) ||
    tooFast ||
    links > MAX_LINKS ||
    FOREIGN_SCRIPT.test(text)
  )
}

/**
 * Verifies a Cloudflare Turnstile token. Fails closed: without a configured
 * secret nothing is ever sent (use Cloudflare's test secret locally).
 * @param env - Function environment
 * @param token - Token from the widget
 * @param ip - Visitor IP reported by Cloudflare
 */
const passesTurnstile = async (env: Env, token: string, ip: string | null) => {
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not configured; dropping submission')
    return false
  }
  if (!token) return false
  const body = new FormData()
  body.append('secret', env.TURNSTILE_SECRET_KEY)
  body.append('response', token)
  if (ip) body.append('remoteip', ip)
  const response = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body })
  const result: { success?: boolean } = await response.json()
  return result.success === true
}

/**
 * Resolves the notification recipients.
 * @param env - Function environment
 */
const recipients = (env: Env) =>
  (env.CONTACT_TO ?? CONTACT_EMAIL)
    .split(',')
    .map((address) => address.trim())
    .filter((address) => EMAIL_PATTERN.test(address))

/**
 * Builds the notification e-mail for the site owner.
 * @param data - Submission
 */
const composeNotification = (data: Submission) => {
  const t = i18n[data.locale].mail
  const details: [string, string][] = [
    [t.nameLabel, data.fullname],
    [t.emailLabel, data.email],
    [t.subjectLabel, data.subject],
  ]
  return {
    subject: format(t.notificationSubject, { subject: data.subject }),
    text: [
      data.message,
      '',
      ...details.map(([label, value]) => `${label}: ${value}`),
      '',
      t.notificationFooter,
    ].join('\n'),
    html: `<p style="white-space:pre-line">${escapeHtml(data.message)}</p>
<table cellpadding="4" style="border-collapse:collapse;margin-top:16px">${details
      .map(
        ([label, value]) =>
          `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
      )
      .join('')}</table>
<p style="color:#777;font-size:12px">${escapeHtml(t.notificationFooter)}</p>`,
  }
}

/**
 * Builds the confirmation e-mail with a copy of the visitor's message.
 * @param data - Submission
 */
const composeConfirmation = (data: Submission) => {
  const t = i18n[data.locale].mail
  const intro = format(t.confirmationText, { name: data.fullname })
  const signature = [SITE_OWNER, CONTACT_EMAIL, 'https://lukaschylik.dev']
  return {
    subject: t.confirmationSubject,
    text: [intro, '', '—', data.message, '', ...signature].join('\n'),
    html: `<p>${escapeHtml(intro)}</p>
<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #a855f7;background:#f6f3f9;white-space:pre-line">${escapeHtml(data.message)}</blockquote>
<p style="color:#555;font-size:14px;line-height:1.6">${signature.map(escapeHtml).join('<br>')}</p>`,
  }
}

/**
 * Sends one e-mail through the Resend API.
 * @param env - Function environment
 * @param email - Resend payload without the sender
 */
const sendEmail = (env: Env, email: Record<string, unknown>) =>
  fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.CONTACT_FROM || DEFAULT_FROM, ...email }),
  })

/**
 * Validates the submission and sends the notification. The confirmation copy
 * to the visitor is only sent after a verified Turnstile challenge, so the
 * form can never be abused to mail arbitrary addresses.
 * @param data - Submission
 * @param env - Function environment
 * @param ip - Visitor IP reported by Cloudflare
 */
const handleSubmission = async (
  data: Submission,
  env: Env,
  ip: string | null,
): Promise<Outcome> => {
  if (looksLikeSpam(data)) return { ok: true }
  if (!(await passesTurnstile(env, data.token, ip))) return { ok: true }

  const invalid = validate(data)
  if (invalid) return { error: invalid, status: 400 }

  const to = recipients(env)
  const unavailable = {
    error: format(i18n[data.locale].mail.unavailable, { email: CONTACT_EMAIL }),
    status: 503,
  }
  if (!env.RESEND_API_KEY || to.length === 0) return unavailable

  const sent = await sendEmail(env, {
    to,
    reply_to: data.email,
    ...composeNotification(data),
  })
  if (!sent.ok) {
    console.error('Resend error', sent.status, await sent.text())
    return unavailable
  }

  const confirmation = await sendEmail(env, {
    to: [data.email],
    reply_to: to,
    ...composeConfirmation(data),
  })
  if (!confirmation.ok) {
    console.error(
      'Confirmation error',
      confirmation.status,
      await confirmation.text(),
    )
  }
  return { ok: true }
}

/**
 * POST /api/contact – contact form → e-mail via Resend.
 *
 * Script submissions (JSON) get `200 { ok: true }` or `4xx/5xx { error }`.
 * Plain form posts cannot carry the Turnstile token or time on page, so they
 * are never sent; the visitor is redirected back with `?formError=true`,
 * whose alert points to the e-mail address.
 * @param context - Pages Function context
 */
export const onRequestPost = async ({
  request,
  env,
}: Context): Promise<Response> => {
  const viaScript = (request.headers.get('Content-Type') ?? '').includes(
    'application/json',
  )

  if (!viaScript) {
    const locale = getLocaleFromPathname(
      new URL(request.headers.get('Referer') ?? request.url).pathname,
    )
    const home = locale === 'en' ? '/en/' : '/'
    return Response.redirect(
      new URL(`${home}?formError=true#contact`, request.url).toString(),
      303,
    )
  }

  let outcome: Outcome
  let locale: Locale = 'sk'
  try {
    const data = await readSubmission(request, viaScript)
    locale = data.locale
    outcome = await handleSubmission(
      data,
      env,
      request.headers.get('CF-Connecting-IP'),
    )
  } catch {
    outcome = { error: i18n[locale].mail.invalid, status: 400 }
  }

  return new Response(JSON.stringify(outcome), {
    status: 'ok' in outcome ? 200 : outcome.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

/**
 * GET /api/contact – reports only whether the required secrets are present
 * in this deployment (never their values), to diagnose configuration.
 * @param context - Pages Function context
 */
export const onRequestGet = ({ env }: Context): Response =>
  new Response(
    JSON.stringify({
      resend: Boolean(env.RESEND_API_KEY),
      turnstile: Boolean(env.TURNSTILE_SECRET_KEY),
    }),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  )
