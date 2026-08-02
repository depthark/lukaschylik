import { component$, Slot } from '@qwik.dev/core'
import { Icon } from '../icon'
import type { ButtonProps } from './button.types'
import { buttonVariants } from './button.variants'

/**
 * Button component with multiple variants and sizes using tailwind-variants
 * Supports both button and anchor elements with type-safe styling
 */
const Button = component$<ButtonProps>(
  ({
    size = 'md',
    variant = 'primary',
    iconOnly = false,
    onClick$,
    disabled,
    ariaLabel,
    className,
    title,
    href,
    rel,
    target,
    type = 'button',
    icon,
    command,
    commandfor,
  }) => {
    const buttonClasses = buttonVariants({
      variant,
      size,
      iconOnly,
      class: className,
    })

    const commonProps = {
      class: buttonClasses,
      'aria-label': ariaLabel,
      title,
      'data-variant': variant,
    }

    const buttonProps = {
      ...commonProps,
      onClick$,
      disabled,
      'aria-disabled': disabled,
      type,
      ...(command && { command }),
      ...(commandfor && { commandfor }),
    }

    const linkProps = {
      ...commonProps,
      href,
      rel,
      target,
      'aria-disabled': disabled,
    }

    const content = (
      <>
        <Slot />
        {icon && <Icon name={icon} size="1rem" />}
      </>
    )

    return href ? (
      <a {...linkProps}>{content}</a>
    ) : (
      <button {...buttonProps}>{content}</button>
    )
  },
)

export default Button
