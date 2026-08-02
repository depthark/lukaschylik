import type { QRL } from '@qwik.dev/core'

/**
 * Props interface for the Card component
 * @interface CardProps
 * @property {string} title - The title text to display in the card
 * @property {string} [path] - Optional URL path for the card link
 * @property {string} [src] - Optional image source URL for the card
 */
export interface CardProps {
  title: string
  path?: string
  price?: number
  priceLabel?: string // when provided, overrides numeric price display
  priceNote?: string // small note under price (e.g., Cena za 1 hod)
  available?: boolean // controls button disabled state
  onClick$?: QRL<() => void>
}
