import type { QRL } from '@qwik.dev/core'

/**
 * Extends the HTMLButtonElement to include custom command attributes
 * used for dialog interactions and other command-based functionality.
 *
 * @interface NewHTMLButtonElement
 * @extends {HTMLButtonElement}
 */
declare global {
  interface NewHTMLButtonElement {
    /** Command to execute when the button is clicked */
    command?: string
    /** ID of the target element the command should affect */
    commandfor?: string
    /** Close command for dialog elements */
    close?: string
  }
}

/**
 * Props for the Button component.
 *
 * @interface ButtonProps
 * @extends {NewHTMLButtonElement}
 */
export interface ButtonProps extends NewHTMLButtonElement {
  /** Click event handler */
  onClick$?: QRL<() => void>

  /** Whether the button is disabled */
  disabled?: boolean

  /** Name of the icon to display (from the icon set) */
  icon?: string

  /** Title attribute (shown on hover) */
  title?: string

  /** Accessible label for screen readers */
  ariaLabel?: string

  /** Additional CSS class names */
  className?: string

  /** If provided, renders an anchor tag with this href */
  href?: string

  /** Relationship of the linked URL (for anchor tags) */
  rel?: string

  /** Type of the button */
  type?: 'button' | 'submit' | 'reset'

  /** Where to display the linked URL (for anchor tags) */
  target?: '_blank' | '_self' | '_parent' | '_top'

  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'plain'

  /** Button size */
  size?: 'sm' | 'md'

  /** Whether the button contains only an icon */
  iconOnly?: boolean
}
