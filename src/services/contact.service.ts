import type { Locale } from '~/i18n/core'
import i18n from '~/sections/contact/contact.i18n.json'

/**
 * Same-origin Cloudflare Pages Function that sends the message via Resend.
 */
export const CONTACT_ENDPOINT = '/api/contact'

/**
 * Contact message payload sent to the site owner.
 */
export interface ContactMessage {
  /** Sender's full name */
  fullname: string
  /** Sender's reply-to email */
  email: string
  /** Subject written by the sender */
  subject: string
  /** Message body */
  message: string
}

/**
 * Sends a contact message through the `/api/contact` Pages Function.
 * Shared by the contact form and the WebMCP `send_contact_message` tool.
 * Time on page is sent along for the server-side spam check.
 * @param data - Message fields
 * @param locale - Locale of the notification and the visitor's confirmation
 * @throws Error with a visitor-facing message when sending fails
 */
export const sendContactMessage = async (
  data: ContactMessage,
  locale: Locale,
): Promise<void> => {
  const response = await fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      locale,
      elapsed: Math.round(performance.now()),
    }),
  })
  const result: { ok?: boolean; error?: string } = await response
    .json()
    .catch(() => ({}))

  if (!response.ok || !result.ok) {
    throw new Error(result.error || i18n[locale].form.error)
  }
}
