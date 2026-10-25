import { component$ } from '@qwik.dev/core'
import { Container, Icon } from '~/components'
import { OPEN_COOKIE_PREFERENCES } from '~/components/cookie-consent/cookie-consent.events'
import { LogoFooter as Logo } from '~/components/logo/logo'
import socialI18n from '~/components/social/social.i18n.json'
import { COMPANY_ID, CONTACT_EMAIL } from '~/constants/business'
import { SOCIAL_LINKS } from '~/constants/socialLinks'
import { localizePath, useLocale } from '~/i18n'
import ui from '~/i18n/ui.json'
import { cls } from '~/utils'
import i18n from './footer.i18n.json'

/**
 * Site footer: brand block with social links, localized quick navigation,
 * contact/address details and the legal row. Backed by a faint blueprint
 * grid matching the hero's design language.
 */
const Footer = component$(() => {
  const locale = useLocale()
  const t = i18n[locale]
  const nav = ui[locale].nav
  const socialLabels = socialI18n[locale].links

  const navLinks = [
    { href: '/#about-me', text: nav.about },
    { href: '/#references', text: nav.references },
    { href: '/#services', text: nav.services },
    { href: '/#contact', text: nav.contact },
    { href: '/sessions/', text: nav.sessions },
    { href: '/blog/', text: nav.blog },
  ]

  return (
    <footer class="site-footer relative isolate bg-black text-white">
      <div class="h-px w-full bg-gradient-to-r from-transparent via-neutral-400/50 to-transparent" />

      <Container size="md" className="relative z-10 isolate py-10 md:py-14">
        <div class="grid grid-cols-1 md:grid-cols-[1.5fr_auto_auto] gap-10 md:gap-14 items-start">
          <div class="text-sm">
            <a
              href={localizePath('/', locale)}
              class={cls(
                'relative',
                'w-[120px] h-[60px]',
                'flex items-center',
                'no-underline',
                'transition-opacity duration-200',
                'opacity-100 hover:opacity-80',
              )}>
              <Logo
                class="w-full h-full max-w-full"
                role="img"
                aria-label={t.logoLabel}
                width="120"
                height="60"
              />
            </a>
            <p class="mt-3 max-w-[46ch] leading-relaxed text-neutral-300">
              {t.tagline}
            </p>
            <ul class="mt-5 flex items-center gap-3 list-none p-0 m-0">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.icon}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialLabels[link.icon]}
                    title={socialLabels[link.icon]}
                    class="grid place-items-center w-9 h-9 rounded-full border border-white/20 text-white transition-colors duration-200 hover:border-yellow-500 hover:text-yellow-400">
                    <Icon name={link.icon} size="1rem" color="currentColor" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label={nav.logoLabel}>
            <ul class="grid gap-2 list-none p-0 m-0 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={localizePath(link.href, locale)}
                    class="text-neutral-300 no-underline transition-colors duration-200 hover:text-white hover:underline underline-offset-4 decoration-yellow-500">
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div class="text-sm md:justify-self-end">
            <address class="not-italic leading-relaxed text-neutral-300">
              <strong class="block text-white font-medium">
                {t.address.name}
              </strong>
              {t.address.street}
              <br />
              {t.address.country}
              <span class="block mt-3">
                <strong>{t.address.companyIdLabel}</strong> {COMPANY_ID}
              </span>
              <span class="block">
                <strong>{t.address.emailLabel}</strong>{' '}
                <a
                  class="hover:underline underline-offset-4 decoration-yellow-500"
                  href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              </span>
            </address>
          </div>
        </div>

        <div class="mt-10 border-t border-white/10 pt-6 flex flex-col md:flex-row flex-wrap items-center justify-center text-center gap-2 md:gap-3 text-xs text-neutral-400">
          <small class="flex items-center gap-1">
            <Icon name="cookie" cls="w-3" />
            <button
              type="button"
              onClick$={() =>
                document.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES))
              }
              class="inline-flex min-h-6 items-center text-white underline underline-offset-2 font-normal hover:text-neutral-200 cursor-pointer">
              {t.cookieSettings}
            </button>
          </small>
          <span class="opacity-30 hidden md:inline">•</span>

          <small>
            <a
              href={localizePath('/gdpr/', locale)}
              class="inline-flex min-h-6 items-center text-white underline underline-offset-2 font-normal hover:text-neutral-200">
              {t.gdprLink}
            </a>
          </small>
          <span class="opacity-30 hidden md:inline">•</span>

          <small class="font-mono">
            ©{new Date().getFullYear()} {t.copyright}
          </small>
        </div>
      </Container>
    </footer>
  )
})

export default Footer
