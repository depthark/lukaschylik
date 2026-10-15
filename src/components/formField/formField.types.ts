import type { QRL } from '@qwik.dev/core'

/**
 * Props for the FormField component.
 */
export interface FormFieldProps {
  /** The label for the form field */
  label?: string
  /** The type of the input field */
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea'
  /** The name attribute for the input field */
  name: string
  /** The value of the input field */
  value: string
  /** The onInput event handler */
  onInput$: QRL<(e: Event) => void>
  /** Whether the input field is required */
  required?: boolean
  /** Custom class name for the input field */
  className?: string
  /** Custom class name for the input/textarea element */
  inputClassName?: string
  /** Whether the input field is disabled */
  disabled?: boolean
  /** Whether the input field is read-only */
  readOnly?: boolean
  /** The placeholder for the input field */
  placeholder?: string
  /** The autocomplete attribute for the input field */
  autocomplete?: string
  /** Parameter description for AI agents when the form is a declarative WebMCP tool */
  toolParamDescription?: string
}
