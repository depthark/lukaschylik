import { $, component$, useStore } from '@qwik.dev/core'
import { useNavigate } from '@qwik.dev/router'
import { Button, Container, FormField, Section } from '~/components'
import SectionTitle from '~/components/section/section.title'
import { localizePath, useLocale } from '~/i18n'
import { subscribeToNewsletter } from '~/services'
import { cls } from '~/utils'
import { bridgeAgentSubmit, resolveAgentSubmit } from '~/webmcp/declarative'
import i18n from './newsletter.i18n.json'

/**
 * Newsletter subscription component
 * Handles subscribe with Mailchimp form submit
 */
const Newsletter = component$(() => {
  const locale = useLocale()
  const t = i18n[locale]
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
   * Handles newsletter subscription. The email is read from the form itself
   * so that a value filled in by an AI agent (declarative WebMCP tool) is used.
   */
  const handleSubscribe = $(
    async (event: SubmitEvent, form: HTMLFormElement) => {
      event.preventDefault()

      const email = String(
        new FormData(form).get('newsletter_email') ?? '',
      ).trim()
      if (!email || state.submitting) return

      state.submitting = true
      state.error = ''

      try {
        await subscribeToNewsletter(email)

        form.reset()
        state.email = ''
        resolveAgentSubmit(form, t.form.agent.subscribed)

        const url = new URL(window.location.href)
        url.searchParams.set('newsletterSubscribed', 'true')
        await nav(`${url.pathname}?${url.searchParams.toString()}`)
      } catch (error) {
        console.error('Subscription error:', error)
        resolveAgentSubmit(form, `${t.form.agent.failed} ${String(error)}`)
        state.error = t.form.error
      } finally {
        state.submitting = false
      }
    },
  )

  return (
    <Section id="newsletter" fullHeight={false}>
      <Container size="sm" className="relative z-10 isolate">
        <SectionTitle
          text={t.title}
          size="sm"
          className="text-black dark:text-white"
          center
        />
        <p
          class={cls(
            'text-center mx-auto text-sm lg:text-base 3xl:text-lg leading-relaxed font-light mb-6 font-mono',
            'text-gray-800 dark:text-gray-300',
          )}>
          {t.description}
        </p>

        <form
          preventdefault:submit
          toolname="newsletter_signup"
          tooldescription={t.form.agent.toolDescription}
          onSubmit$={[bridgeAgentSubmit, handleSubscribe]}
          method="post"
          class="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-end">
          <FormField
            className="flex-1"
            label={t.form.emailLabel}
            type="email"
            name="newsletter_email"
            toolParamDescription={t.form.agent.email}
            placeholder={t.form.emailPlaceholder}
            value={state.email}
            inputClassName="text-black dark:text-white"
            onInput$={handleEmailInput}
            autocomplete="email"
            disabled={state.submitting}
            required
          />
          <Button
            type="submit"
            title={t.form.submit}
            variant="secondary"
            disabled={state.submitting}>
            {state.submitting ? t.form.submitting : t.form.submit}
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
          {t.gdpr.before}{' '}
          <a
            href={localizePath('/gdpr/', locale)}
            class="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300">
            {t.gdpr.link}
          </a>
          {t.gdpr.after}
        </small>
      </Container>
    </Section>
  )
})

export default Newsletter
