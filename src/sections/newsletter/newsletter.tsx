import { $, component$, useStore } from '@qwik.dev/core'
import { useNavigate } from '@qwik.dev/router'
import { Button, Container, FormField, Section } from '~/components'
import SectionTitle from '~/components/section/section.title'
import { cls } from '~/utils'

const MAILCHIMP_FORM_URL =
  'https://lukaschylik.us6.list-manage.com/subscribe/post?u=e4c1b2f028f9fc3c28ad28630&id=90b3c6481a&f_id=00d309e3f0'
const MAILCHIMP_HONEYPOT_FIELD = 'b_e4c1b2f028f9fc3c28ad28630_90b3c6481a'

/**
 * Newsletter subscription component
 * Handles subscribe with Mailchimp form submit
 */
const Newsletter = component$(() => {
  const nav = useNavigate()
  const state = useStore({
    email: '',
    submitting: false,
    error: '',
  })

  /**
   * Handles email input change
   */
  const handleEmailInput = $((e: Event) => {
    state.email = (e.target as HTMLInputElement).value
  })

  /**
   * Handles newsletter subscription
   */
  const handleSubscribe = $(async (event: SubmitEvent) => {
    event.preventDefault()

    if (!state.email || state.submitting) return

    state.submitting = true
    state.error = ''

    try {
      const formData = new FormData()
      formData.append('EMAIL', state.email)
      // Bot trap required by Mailchimp.
      formData.append(MAILCHIMP_HONEYPOT_FIELD, '')

      await fetch(MAILCHIMP_FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      })

      state.email = ''

      const url = new URL(window.location.href)
      url.searchParams.set('newsletterSubscribed', 'true')
      await nav(`${url.pathname}?${url.searchParams.toString()}`)
    } catch (error) {
      console.error('Subscription error:', error)
      state.error = 'Nepodarilo sa prihlásiť na odber. Skúste to prosím znova.'
    } finally {
      state.submitting = false
    }
  })

  return (
    <Section id="newsletter" fullHeight={false}>
      <Container size="sm" className="relative z-10 isolate">
        <SectionTitle
          text="Newsletter"
          size="sm"
          className="text-black dark:text-white"
          center
        />
        <p
          class={cls(
            'text-center mx-auto text-sm lg:text-base 3xl:text-lg leading-relaxed font-light mb-6 font-mono',
            'text-gray-800 dark:text-gray-300',
          )}>
          Buďte informovaní o novinkách a článkoch!
        </p>

        <form
          preventdefault:submit
          onSubmit$={handleSubscribe}
          method="post"
          class="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-end">
          <div aria-hidden="true" style="position:absolute; left:-5000px;">
            <input
              type="text"
              name={MAILCHIMP_HONEYPOT_FIELD}
              tabIndex={-1}
              defaultValue=""
            />
          </div>
          <FormField
            className="flex-1"
            label="Váš email"
            type="email"
            name="newsletter_email"
            placeholder="john.doe@email.com"
            value={state.email}
            inputClassName="text-black dark:text-white"
            onInput$={handleEmailInput}
            disabled={state.submitting}
            required
          />
          <Button
            type="submit"
            title="Odoberať"
            variant="secondary"
            disabled={state.submitting || !state.email}>
            {state.submitting ? 'Odosielam...' : 'Odoberať'}
          </Button>
        </form>
        {state.error && (
          <p class="mt-2 text-red-500 dark:text-red-400 text-sm">
            {state.error}
          </p>
        )}

        <small
          class={cls(
            'mt-6 text-center block',
            'text-gray-500 dark:text-gray-400',
          )}>
          Vaše údaje spracúvam v súlade s{' '}
          <a
            href="/gdpr/"
            class="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300">
            GDPR
          </a>
          .
        </small>
      </Container>
    </Section>
  )
})

export default Newsletter
