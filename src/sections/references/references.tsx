import { component$ } from '@qwik.dev/core'
import { Button } from '~/components'
import Container from '~/components/container/container'
import Reference from '~/components/reference/reference'
import Section from '~/components/section/section'
import SectionTitle from '~/components/section/section.title'
import { REFERENCES } from '~/constants/references'
import { localizePath, useLocale } from '~/i18n'
import i18n from './references.i18n.json'

const References = component$(() => {
  const locale = useLocale()
  const t = i18n[locale]

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
                <div class="flex flex-wrap gap-4">
                  <Button
                    variant="secondary"
                    ariaLabel={t.servicesButton}
                    title={t.servicesButton}
                    href="#services">
                    {t.servicesButton}
                  </Button>
                  <Button
                    variant="primary"
                    ariaLabel={t.sessionsButton}
                    title={t.sessionsButton}
                    href={localizePath('/sessions/', locale)}>
                    {t.sessionsButton}
                  </Button>
                </div>
              </div>
            </div>
            <ul class="ref-list list-none p-0 m-0 min-w-0">
              {REFERENCES.map((reference) => (
                <Reference
                  key={reference.webURL}
                  title={reference.title}
                  img={reference.img}
                  webURL={reference.webURL}
                  website={reference.website}
                  type={t.types[reference.type]}
                />
              ))}
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
        </div>
      </Container>
    </Section>
  )
})

export default References
