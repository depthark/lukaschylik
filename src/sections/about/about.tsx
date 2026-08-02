import { component$ } from '@qwik.dev/core'
import { Container, Section, Skills } from '~/components'
import SectionTitle from '~/components/section/section.title'
import { useLocale } from '~/i18n'
import { cls } from '~/utils'
import i18n from './about.i18n.json'

/**
 * Rich text segment with optional bold emphasis.
 */
type Segment = { text: string; strong: boolean }

/**
 * Renders rich text segments, wrapping emphasized ones in a strong element.
 * @param props.segments - Ordered text segments to render
 */
const RichText = (props: { segments: Segment[] }) => (
  <>
    {props.segments.map((segment) =>
      segment.strong ? (
        <strong key={segment.text}>{segment.text}</strong>
      ) : (
        segment.text
      ),
    )}
  </>
)

/**
 * About section with a short bio and portrait photo.
 */
const About = component$(() => {
  const t = i18n[useLocale()]

  return (
    <Section id="about-me" className="content-center">
      <Container size="full" className="relative z-10 isolate text-left">
        <div
          class={cls(
            'grid grid-cols-1 items-start',
            'lg:grid-cols-[5fr_8fr] lg:grid-rows-[auto_1fr]',
          )}>
          <SectionTitle
            text={t.title}
            className="about-title lg:row-start-1 lg:col-span-2 lg:col-start-1"
          />
          <div class="content-fade-in">
            {t.paragraphs.map((paragraph) => (
              <p
                key={paragraph[0].text}
                class="text-sm lg:text-base 3xl:text-lg leading-relaxed font-light mb-4 md:mb-8 text-gray-800 dark:text-gray-300 font-mono">
                <RichText segments={paragraph} />
              </p>
            ))}
          </div>
          <div class="lg:row-start-1 lg:row-span-2 lg:col-start-2">
            <img
              class="me relative z-0 block mx-auto"
              src="/images/me.webp"
              alt={t.photoAlt}
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
