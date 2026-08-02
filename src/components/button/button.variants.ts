import { tv } from 'tailwind-variants'

/**
 * Button component variants using tailwind-variants
 * Preserves custom CSS properties and gradient effects from the original implementation
 */
export const buttonVariants = tv({
  base: [],
  variants: {
    variant: {
      primary: [
        'btn',
        'inline-flex items-center justify-center gap-8',
        'relative overflow-clip leading-none',
        'cursor-pointer rounded-lg border border-black dark:border-white',
        'disabled:opacity-50 disabled:pointer-events-none',
        'text-transparent',
      ],
      secondary: [
        'btn',
        'inline-flex items-center justify-center gap-8',
        'relative overflow-clip leading-none',
        'cursor-pointer rounded-lg border border-black dark:border-white',
        'disabled:opacity-50 disabled:pointer-events-none',
        'text-transparent',
      ],
      plain: [
        'all-[unset]',
        'cursor-pointer',
        'border-0 px-0 py-0 m-0',
        'bg-transparent text-current',
        'hover:opacity-80',
      ],
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm sm:text-base font-bold uppercase',
    },
    iconOnly: {
      true: 'p-3',
      false: '',
    },
  },
  compoundVariants: [
    {
      size: 'sm',
      iconOnly: false,
      class: 'px-3 py-2 sm:px-4 sm:py-2 sm:text-sm',
    },
    {
      size: 'md',
      iconOnly: false,
      class: 'px-5 py-3 sm:px-6 sm:py-4 sm:text-base min-w-[180px]',
    },
    {
      size: 'sm',
      iconOnly: true,
      class: 'text-xs',
    },
    {
      size: 'md',
      iconOnly: true,
      class: 'text-sm',
    },
    {
      variant: 'plain',
      class: 'min-w-none px-0 py-0 sm:px-0 sm:py-0',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    iconOnly: false,
  },
})
