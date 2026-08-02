import { $, component$, useStore } from '@qwik.dev/core'
import { useNavigate } from '@qwik.dev/router'
import { Button, Container, FormField, Section } from '~/components'
import Icon from '~/components/icon/icon'
import SectionTitle from '~/components/section/section.title'
import socialI18n from '~/components/social/social.i18n.json'
import { SOCIAL_LINKS } from '~/constants/socialLinks'
import { useLocale } from '~/i18n'
import { cls } from '~/utils'
import i18n from './contact.i18n.json'

/**
 * Contact section component
 * Renders a contact form with validation and form submission handling
 */
const Contact = component$(() => {
  const locale = useLocale()
  const t = i18n[locale]
  const state = useStore({
    fullname: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
    submitting: false,
  })
  const nav = useNavigate()

  /**
   * Handles form submission
   */
  const handleSubmit = $(async (event: SubmitEvent) => {
    event.preventDefault()

    if (state.honeypot) {
      console.warn('Bot detected')
      return
    }

    if (state.submitting) return
    state.submitting = true

    try {
      const formData = new FormData(event.target as HTMLFormElement)
      formData.delete('botcheck')

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit form')
      }

      state.fullname = ''
      state.email = ''
      state.subject = ''
      state.message = ''
      state.honeypot = ''

      const url = new URL(window.location.href)
      url.searchParams.set('formSubmitted', 'true')
      await nav(`${url.pathname}?${url.searchParams.toString()}`)
    } catch (error) {
      console.error('Form submission error:', error)
      alert(t.form.error)
    } finally {
      state.submitting = false
    }
  })

  /**
   * Handles fullname input change
   */
  const handleFullnameInput = $((e: Event) => {
    state.fullname = (e.target as HTMLInputElement).value
  })

  /**
   * Handles email input change
   */
  const handleEmailInput = $((e: Event) => {
    state.email = (e.target as HTMLInputElement).value
  })

  /**
   * Handles subject input change
   */
  const handleSubjectInput = $((e: Event) => {
    state.subject = (e.target as HTMLInputElement).value
  })

  /**
   * Handles message input change
   */
  const handleMessageInput = $((e: Event) => {
    state.message = (e.target as HTMLTextAreaElement).value
  })

  /**
   * Handles honeypot input change (bot trap)
   */
  const handleHoneypotInput = $((e: Event) => {
    state.honeypot = (e.target as HTMLInputElement).value
  })

  return (
    <Section id="contact" className="bg-black dark:bg-white">
      <Container size="full" className="relative z-10 isolate">
        <SectionTitle text={t.title} dark={true} />
        <p
          class={cls(
            'text-sm lg:text-base 3xl:text-lg leading-relaxed font-light',
            'mb-4 sm:mb-12',
            'font-mono text-gray-800',
            'content-fade-in',
          )}>
          {t.intro} <strong>{t.introStrong}</strong>
        </p>

        <div
          class={cls(
            'flex items-center justify-start gap-3',
            'mb-10 sm:mb-18',
            'content-fade-in',
          )}>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.icon}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialI18n[locale].links[link.icon]}
              title={socialI18n[locale].links[link.icon]}
              class={cls(
                'group flex items-center justify-center',
                'w-10 h-10 rounded-full',
                'bg-black hover:bg-gray-900',
                'transition-all duration-300 hover:scale-110',
                'focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-black',
              )}>
              <Icon
                name={link.icon}
                cls={cls(
                  'w-5 h-5',
                  'text-white group-hover:text-gray-200',
                  'transition-colors duration-300',
                )}
              />
            </a>
          ))}
        </div>

        <form
          preventdefault:submit
          method="post"
          onSubmit$={handleSubmit}
          class={cls(
            'grid grid-cols-1 gap-4 md:gap-6',
            'content-fade-in content-fade-in--entry',
          )}>
          <input
            type="hidden"
            name="access_key"
            value="fb75ad8a-4efe-4daf-9312-3ebd38d3c228"
          />
          <input type="hidden" name="subject" value={t.form.hiddenSubject} />
          <input type="hidden" name="from_name" value={t.form.hiddenFromName} />
          <div
            class="absolute -left-[9999px] opacity-0 pointer-events-none"
            aria-hidden="true">
            <label for="botcheck">{t.form.honeypotLabel}</label>
            <input
              type="text"
              id="botcheck"
              name="botcheck"
              value={state.honeypot}
              onInput$={handleHoneypotInput}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <FormField
            label={t.form.fullname}
            type="text"
            name="fullname"
            value={state.fullname}
            onInput$={handleFullnameInput}
            required
          />
          <FormField
            label={t.form.email}
            type="email"
            name="email"
            value={state.email}
            onInput$={handleEmailInput}
            required
          />
          <FormField
            label={t.form.subject}
            type="text"
            name="user_subject"
            value={state.subject}
            onInput$={handleSubjectInput}
            required
          />
          <FormField
            label={t.form.message}
            type="textarea"
            name="message"
            value={state.message}
            onInput$={handleMessageInput}
            required
          />
          <Button
            type="submit"
            title={t.form.submit}
            variant="primary"
            className="!border-black"
            disabled={state.submitting}
            icon="send">
            {state.submitting ? t.form.submitting : t.form.submit}
          </Button>
        </form>
      </Container>
    </Section>
  )
})

export default Contact
