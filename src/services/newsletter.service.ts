const MAILCHIMP_FORM_URL =
  'https://lukaschylik.us6.list-manage.com/subscribe/post?u=e4c1b2f028f9fc3c28ad28630&id=90b3c6481a&f_id=00d309e3f0'

/**
 * Hidden Mailchimp bot-trap field name; must be submitted empty.
 */
const MAILCHIMP_HONEYPOT_FIELD = 'b_e4c1b2f028f9fc3c28ad28630_90b3c6481a'

/**
 * Subscribes an email address to the Mailchimp newsletter list.
 * Shared by the newsletter form and the WebMCP `subscribe_newsletter` tool.
 * The request is opaque (`no-cors`), so only network failures reject.
 * @param email - Subscriber email address
 */
export const subscribeToNewsletter = async (email: string): Promise<void> => {
  const formData = new FormData()
  formData.append('EMAIL', email)
  // Bot trap required by Mailchimp.
  formData.append(MAILCHIMP_HONEYPOT_FIELD, '')

  await fetch(MAILCHIMP_FORM_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData,
  })
}
