import { component$ } from '@qwik.dev/core'
import type { FormFieldProps } from './formField.types'

/**
 * FormField component renders a label and an input or textarea element based on the type prop.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.label - The label text for the form field.
 * @param {string} props.type - The type of the form field, either "input" or "textarea".
 * @param {string} props.name - The name attribute for the form field.
 * @param {string} props.value - The value of the form field.
 * @param {Function} props.onInput$ - The input event handler.
 * @param {boolean} props.required - Whether the form field is required.
 * @param {string} [props.className] - Additional class names for the form field.
 * @param {boolean} [props.disabled] - Whether the form field is disabled.
 * @param {boolean} [props.readOnly] - Whether the form field is read-only.
 * @param {string} [props.placeholder] - The placeholder text for the form field.
 * @param {string} [props.autocomplete] - The autocomplete attribute for the form field.
 * @returns {JSX.Element} The rendered form field component.
 */
const FormField = component$<FormFieldProps>(
  ({
    label,
    type,
    name,
    value,
    onInput$,
    required,
    className,
    inputClassName,
    disabled,
    readOnly,
    placeholder,
    autocomplete,
  }) => {
    const inputClass = [
      type === 'textarea' ? 'field-sizing-content min-h-40' : '',
      'block w-full bg-transparent border-gray-600 dark:border-gray-400 border-b-1 px-2 md:px-6 py-2 md:py-4 user-invalid:border-red-500 user-valid:border-green-400 text-base text-black placeholder-gray-500 dark:placeholder-gray-400',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ')

    const labelClass = [
      'text-black grid gap-2 text-sm sm:text-md md:text-lg font-mono',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <label class={labelClass} for={name}>
        {label}
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onInput$={onInput$}
            required={required}
            class={inputClass}
            aria-label={label}
            aria-invalid={!value && required}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
          />
        ) : (
          <input
            id={name}
            type={type}
            name={name}
            value={value}
            onInput$={onInput$}
            required={required}
            class={inputClass}
            aria-label={label}
            autocomplete="on"
            aria-invalid={!value && required}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            autoComplete={autocomplete}
          />
        )}
      </label>
    )
  },
)

export default FormField
