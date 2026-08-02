import { component$ } from '@qwik.dev/core'
import { Container, Section, Skills } from '~/components'
import SectionTitle from '~/components/section/section.title'
import { cls } from '~/utils'

const About = component$(() => {
  return (
    <Section id="about-me" className="content-center">
      <Container size="full" className="relative z-10 isolate text-left">
        <div
          class={cls(
            'grid grid-cols-1 items-start',
            'lg:grid-cols-[5fr_8fr] lg:grid-rows-[auto_1fr]',
          )}>
          <SectionTitle
            text="Niečo o mne"
            className="about-title lg:row-start-1 lg:col-span-2 lg:col-start-1"
          />
          <div class="content-fade-in">
            <p class="text-sm lg:text-base 3xl:text-lg leading-relaxed font-light mb-4 md:mb-8 text-gray-800 dark:text-gray-300 font-mono">
              Som frontend developer s <strong>veľkým presahom do UX/UI</strong>
              . Za posledných 10 rokov som pracoval na projektoch od
              prezentačných webov po PWA a informačné systémy.
              <strong>Technické SEO a prístupnosť</strong> sú samozrejmosťou.
              Venujem sa implementácii
              <strong> dizajnových systémov</strong> aj{' '}
              <strong>efektívnemu využívaniu AI vo vývoji</strong>.
            </p>
            <p class="text-sm lg:text-base 3xl:text-lg leading-relaxed font-light mb-4 md:mb-8 text-gray-800 dark:text-gray-300 font-mono">
              Pomáham tímom <strong>efektívne využívať AI</strong> s dôrazom na
              produktivitu a kvalitu kódu. Skúsenosti odovzdávam cez
              konzultácie, workshopy a školenia.
            </p>
            <p class="text-sm lg:text-base 3xl:text-lg leading-relaxed font-light mb-4 md:mb-8 text-gray-800 dark:text-gray-300 font-mono">
              Okrem vývoja sa venujem aj prednášaniu na rôznych meetupoch a
              konferenciách.
            </p>
          </div>
          <div class="lg:row-start-1 lg:row-span-2 lg:col-start-2">
            <img
              class="me relative z-0 block mx-auto"
              src="/images/me.webp"
              alt="Fotografia Lukáša Chylika"
              loading="lazy"
              width={768}
              height={768}
            />
          </div>
        </div>
      </Container>
      <Skills />
    </Section>
  )
})

export default About
