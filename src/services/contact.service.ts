import type { Locale } from '~/i18n/core'
import i18n from '~/sections/contact/contact.i18n.json'

const WEB3FORMS_URL = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = 'fb75ad8a-4efe-4daf-9312-3ebd38d3c228'

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
 * Sends a contact message through Web3Forms.
 * Shared by the contact form and the WebMCP `send_contact_message` tool.
 * @param data - Message fields
 * @param locale - Locale used for the notification subject and sender name
 * @throws Error when Web3Forms rejects the submission
 */
export const sendContactMessage = async (
  data: ContactMessage,
  locale: Locale,
): Promise<void> => {
  const t = i18n[locale].form
  const formData = new FormData()
  formData.append('access_key', WEB3FORMS_ACCESS_KEY)
  formData.append('subject', t.hiddenSubject)
  formData.append('from_name', t.hiddenFromName)
  formData.append('fullname', data.fullname)
  formData.append('email', data.email)
  formData.append('user_subject', data.subject)
  formData.append('message', data.message)

  const response = await fetch(WEB3FORMS_URL, {
    method: 'POST',
    body: formData,
  })
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.message || 'Failed to submit form')
  }
}
