import { component$, useContext } from '@qwik.dev/core'
import { Card, ListItem } from '~/components'
import Container from '~/components/container/container'
import Section from '~/components/section/section'
import SectionTitle from '~/components/section/section.title'
import { CONSULTING_HOURLY_RATE_CZK } from '~/constants/business'
import { useLocale } from '~/i18n'
import { DialogContext } from '~/utils'
import i18n from './services.i18n.json'

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
 * Renders a card's feature list with optional custom markers.
 * @param props.items - List entries with text and optional marker
 */
const CardItems = (props: { items: { text: string; marker: string }[] }) => (
  <ul class="grid gap-2 content-start">
    {props.items.map((item) => (
      <ListItem
        key={item.text}
        className="text-xs sm:text-sm md:text-sm"
        marker={item.marker || undefined}>
        {item.text}
      </ListItem>
    ))}
  </ul>
)

/**
 * Services section listing consulting, workshop and speaking offerings.
 */
const References = component$(() => {
  const dialogContext = useContext(DialogContext)
  const t = i18n[useLocale()]

  return (
    <Section id="services">
      <Container size="full">
        <SectionTitle text={t.title} />
        <div class="content-fade-in">
          <p class="text-sm lg:text-base 3xl:text-lg leading-relaxed font-light mb-18 text-gray-800 dark:text-gray-300 font-mono">
            <RichText segments={t.intro} />
          </p>
        </div>
        <div class="services grid text-white gap-2 md:gap-4 xl:gap-8">
          <Card
            title={t.cards.consulting.title}
            price={CONSULTING_HOURLY_RATE_CZK}
            priceNote={t.cards.consulting.priceNote}
            onClick$={dialogContext.showDialog}>
            <p class="text-sm text-gray-800 dark:text-gray-300">
              <RichText segments={t.cards.consulting.description} />
            </p>
            <CardItems items={t.cards.consulting.items} />
          </Card>
          <Card
            title={t.cards.workshops.title}
            priceLabel={t.cards.workshops.priceLabel}
            available={true}>
            <p class="text-sm text-gray-800 dark:text-gray-300">
              <RichText segments={t.cards.workshops.description} />
            </p>
            <CardItems items={t.cards.workshops.items} />
          </Card>
          <Card
            title={t.cards.speaking.title}
            priceLabel={t.cards.speaking.priceLabel}
            available={true}>
            <p class="text-sm text-gray-800 dark:text-gray-300">
              <RichText segments={t.cards.speaking.description} />
            </p>
            <CardItems items={t.cards.speaking.items} />
          </Card>
        </div>
      </Container>
    </Section>
  )
})

export default References
