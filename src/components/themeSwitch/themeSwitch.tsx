import { $, component$ } from '@qwik.dev/core'
import { useLocale } from '~/i18n'
import ui from '~/i18n/ui.json'
import { applyTheme, getDocumentTheme, storeTheme } from '~/utils'
import { Button } from '../button'
import { Icon } from '../icon'

/**
 * Theme toggle button component.
 * @returns JSX button element
 */
const ThemeSwitch = component$(() => {
  const t = ui[useLocale()]

  /**
   * Handles theme toggle on button click.
   */
  const handleToggle = $(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return

    const currentTheme = getDocumentTheme(document) ?? 'light'
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'

    applyTheme(nextTheme, document)
    storeTheme(nextTheme, window.localStorage)
  })

  return (
    <Button
      type="button"
      className="text-black dark:text-white p-0"
      onClick$={handleToggle}
      variant="plain"
      ariaLabel={t.themeSwitch.label}
      title={t.themeSwitch.label}>
      <span class="inline-flex dark:hidden" aria-hidden="true">
        <Icon name="sun" size="1.5rem" color="currentColor" />
      </span>
      <span class="hidden dark:inline-flex" aria-hidden="true">
        <Icon name="moon" size="1.5rem" color="currentColor" />
      </span>
    </Button>
  )
})

export default ThemeSwitch
