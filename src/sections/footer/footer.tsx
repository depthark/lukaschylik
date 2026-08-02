import { component$ } from '@qwik.dev/core'
import { Container, Icon } from '~/components'
import { localizePath, useLocale } from '~/i18n'
import Logo from '~/images/logos/logo-footer.svg?jsx'
import { cls } from '~/utils'
import i18n from './footer.i18n.json'

const Footer = component$(() => {
  const locale = useLocale()
  const t = i18n[locale]

  return (
    <footer class="relative bg-black text-white">
      <div class="h-px w-full bg-gradient-to-r from-transparent via-neutral-400/50 to-transparent" />

      <Container size="md" className="relative z-10 isolate py-8 md:py-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 md:gap-x-10 md:gap-y-2 items-start">
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
            <p class="mt-2 mb-4 md:mb-0 max-w-[60ch] text-neutral-300">
              {t.tagline}
            </p>
          </div>

          <div class="md:justify-self-end text-sm">
            <address class="not-italic leading-relaxed text-neutral-300">
              {t.address.name}
              <br />
              {t.address.street}
              <br />
              {t.address.country}
              <br />
              <span class="block mt-2">
                <strong>{t.address.companyIdLabel}</strong> 05483247
              </span>
              <span class="block">
                <strong>{t.address.emailLabel}</strong>{' '}
                <a class="hover:underline" href="mailto:chylik.lukas@gmail.com">
                  chylik.lukas@gmail.com
                </a>
              </span>
            </address>
          </div>
        </div>

        <div class="mt-8 flex flex-col md:flex-row flex-wrap items-center justify-center text-center gap-2 md:gap-3 text-xs text-neutral-400">
          {/* Cookies link-like button */}
          <small class="flex items-center gap-1">
            <Icon name="cookie" cls="w-3" />
            <button
              type="button"
              onClick$={() => (window as any).__openCookiePreferences?.()}
              class="text-white underline underline-offset-2 font-normal hover:text-neutral-200 cursor-pointer">
              {t.cookieSettings}
            </button>
          </small>
          <span class="opacity-30 hidden md:inline">•</span>

          {/* GDPR link */}
          <small>
            <a
              href={localizePath('/gdpr/', locale)}
              class="text-white underline underline-offset-2 font-normal hover:text-neutral-200">
              {t.gdprLink}
            </a>
          </small>
          <span class="opacity-30 hidden md:inline">•</span>

          {/* Copyright last */}
          <small class="font-mono">
            ©{new Date().getFullYear()} {t.copyright}
          </small>
        </div>
      </Container>
    </footer>
  )
})

export default Footer
