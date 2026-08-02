import { $, component$ } from '@qwik.dev/core'
import { Button } from '~/components'
import Container from '~/components/container/container'
import Reference from '~/components/reference/reference'
import Section from '~/components/section/section'
import SectionTitle from '~/components/section/section.title'
import { useLocale } from '~/i18n'
import i18n from './references.i18n.json'

const VIDEO_SOURCES = [
  'https://www.youtube.com/embed/MCVuRMBOXUU?si=MC5Ah5u53jbdbfYZ',
  'https://www.youtube.com/embed/FAbaIpGWmR4?si=0_zKp6MHe_-_n6P8',
  'https://www.youtube.com/embed/eTjXcx5DUqM?si=P3ea1dfnwKqxrzyC',
  'https://www.youtube.com/embed/ITDfqStMym0?si=sWTLYIfZVc-OusDf',
  'https://www.youtube.com/embed/hwhuSdO5fU0?si=ZckQ-cJlCGZpJExv',
  'https://www.youtube.com/embed/p8sQyt4YFdk?si=WDxTC4029EeFecKk',
]

const References = component$(() => {
  const t = i18n[useLocale()]

  const openPiP = $((event: MouseEvent) => {
    const button = (event.target as HTMLElement).closest('button[data-pip]')
    if (!button) return

    const wrapper = button.parentElement
    if (!wrapper) return

    const iframe = wrapper.querySelector('iframe')
    if (!iframe) return

    if (!('documentPictureInPicture' in window)) {
      return
    }

    ;(window as any).documentPictureInPicture
      .requestWindow({ width: 640, height: 360 })
      .then((pipWindow: any) => {
        pipWindow.document.head.innerHTML = `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;width:100%;height:100vh}iframe{width:100%;height:100%;border:none}</style>`

        const placeholder = document.createElement('div')
        placeholder.className = iframe.className
        placeholder.style.cssText =
          'display:flex;align-items:center;justify-content:center;color:#888;font-size:14px;font-family:monospace'
        placeholder.textContent = t.pipPlaceholder
        wrapper.insertBefore(placeholder, iframe)

        pipWindow.document.body.append(iframe)

        pipWindow.addEventListener('pagehide', () => {
          placeholder.replaceWith(iframe)
        })
      })
  })
  return (
    <Section id="references" centerContent={false} fullHeight={false}>
      <Container size="full">
        <div class="relative grid gap-5 isolate">
          <div>
            <SectionTitle text={t.title} />
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-[34fr_21fr] gap-5 lg:gap-10 items-start">
            <div class="mb-8 xl:mb-0">
              <div>
                <p class="text-sm lg:text-base 3xl:text-lg leading-relaxed font-light mb-4 md:mb-8 text-gray-800 dark:text-gray-300 font-mono">
                  {t.paragraph1}
                </p>
                <p class="text-sm lg:text-base 3xl:text-lg leading-relaxed font-light mb-4 md:mb-8 text-gray-800 dark:text-gray-300 font-mono">
                  {t.paragraph2}
                </p>

                <p class="text-sm lg:text-base 3xl:text-lg leading-relaxed font-light mb-8 md:mb-16 text-gray-800 dark:text-gray-300 font-mono">
                  {t.paragraph3Before}&nbsp;
                  <a
                    class="underline"
                    href="https://www.frontendisti.cz/"
                    target="_blank"
                    rel="noopener noreferrer">
                    {t.paragraph3Link}
                  </a>
                  {t.paragraph3After}
                </p>
                <Button
                  variant="secondary"
                  ariaLabel={t.servicesButton}
                  title={t.servicesButton}
                  href="#services">
                  {t.servicesButton}
                </Button>
              </div>
            </div>
            <ul class="ref-list list-none p-0 m-0 min-w-0">
              <Reference
                title="Vertice"
                img="/images/references/vertice.avif"
                webURL="https://vertice.one/"
                website="vertice.one"
                type={t.types.designSystem}
              />
              <Reference
                title="VIGo"
                img="/images/references/vigo.avif"
                webURL="https://vig.cz/"
                website="vig.cz"
                type={t.types.designSystem}
              />
              <Reference
                title="Riganti"
                img="/images/references/riganti.avif"
                webURL="https://www.riganti.cz/"
                website="riganti.cz"
                type={t.types.collaboration}
              />
              <Reference
                title="Update Conference"
                img="/images/references/update-conference.avif"
                webURL="https://www.updateconference.net/"
                website="updateconference.net"
                type={t.types.collaboration}
              />
              <Reference
                title="Update Days"
                img="/images/references/update-days.avif"
                webURL="https://www.updatedays.cz/"
                website="updatedays.cz"
                type={t.types.collaboration}
              />
              <Reference
                title="Meetupdate"
                img="/images/references/meetupdate.avif"
                webURL="https://www.meetupdate.cz/"
                website="meetupdate.cz"
                type={t.types.collaboration}
              />
              <Reference
                title="DotVVM"
                img="/images/references/dotvvm.avif"
                webURL="https://www.dotvvm.com/"
                website="dotvvm.com"
                type={t.types.collaboration}
              />
              <Reference
                title="Brand DESIGN"
                img="/images/references/brand-design.avif"
                webURL="https://brand-design.cz/"
                website="brand-design.cz"
                type={t.types.web}
              />
              <Reference
                title="Elendris"
                img="/images/references/elendris.avif"
                webURL="https://elendris.cz/"
                website="elendris.cz"
                type={t.types.web}
              />
              <Reference
                title="Anew style"
                img="/images/references/anewstyle.avif"
                webURL="https://anewstyle.cz/"
                website="anewstyle.cz"
                type={t.types.web}
              />
              {/* <Reference
              title="Krossbau s.r.o."
              webURL="https://www.krossbau.cz/"
              website="krossbau.cz"
              type="Web"
            />
            <Reference
              title="IVPA Okná"
              webURL="https://ivpaokna.sk/"
              website="ivpaokna.sk"
              type="Web"
            />
            <Reference
              title="Brand Design"
              webURL="https://brand-design.cz/"
              website="brand-design.cz"
              type="Web"
            />
            <Reference
              title="Filtre na mlieko"
              webURL="https://filtrenamlieko.sk/"
              website="filtrenamlieko.sk"
              type="Web"
            />
            <Reference
              title="IVPA bau"
              webURL="https://ivpabau.de/"
              website="ivpabau.de"
              type="Web"
            />
            */}
            </ul>
          </div>
          <div
            class="video-carousel relative
        grid grid-flow-col [grid-auto-columns:calc(100%-2rem)] md:[grid-auto-columns:min(480px,60%)] gap-3 md:gap-5
        mt-10 md:mt-16 max-w-full
        overflow-x-auto overscroll-x-contain scroll-smooth
        snap-x snap-mandatory [scroll-padding-inline:1rem]
        [scrollbar-width:none] [-ms-overflow-style:'none'] [&::-webkit-scrollbar]:hidden
        [&>*]:min-w-0 [&>*]:snap-center [&>*]:snap-always">
            {VIDEO_SOURCES.map((src, index) => (
              <div key={src} class="relative group" onClick$={openPiP}>
                <iframe
                  class="w-full aspect-video block rounded-lg overflow-clip border-2 border-black dark:border-white"
                  loading="lazy"
                  width="560"
                  src={src}
                  title={t.videoTitles[index]}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullscreen></iframe>
                <button
                  type="button"
                  data-pip
                  aria-label={t.pipButton}
                  title={t.pipButton}
                  class="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <rect x="11" y="9" width="10" height="7" rx="1" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
})

export default References
