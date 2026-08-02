/**
 * Supported UI themes.
 */
export type Theme = 'light' | 'dark'

/**
 * Name of the document attribute that stores the active theme.
 */
const THEME_ATTRIBUTE = 'data-theme'

/**
 * Storage key used for the persisted theme preference.
 */
const THEME_STORAGE_KEY = 'theme'

/**
 * Media query used to resolve the system color scheme.
 */
const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)'

const THEME_COLOR_META_SELECTOR = 'meta[name="theme-color"]'

const THEME_COLORS: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#000000',
}

/**
 * Returns whether the provided value is a supported theme.
 */
function isTheme(value: string | null | undefined): value is Theme {
  return value === 'light' || value === 'dark'
}

/**
 * Returns the active document theme when one is already applied.
 */
export function getDocumentTheme(documentRef: Document): Theme | null {
  const documentTheme =
    documentRef.documentElement.getAttribute(THEME_ATTRIBUTE)

  if (isTheme(documentTheme)) {
    return documentTheme
  }

  return null
}

/**
 * Persists the chosen theme to storage.
 */
export function storeTheme(
  theme: Theme,
  storage: Pick<Storage, 'setItem'>,
): void {
  storage.setItem(THEME_STORAGE_KEY, theme)
}

/**
 * Applies the chosen theme to the current document.
 */
export function applyTheme(theme: Theme, documentRef: Document): void {
  documentRef.documentElement.setAttribute(THEME_ATTRIBUTE, theme)
  documentRef.documentElement.style.colorScheme = theme

  const themeColorMeta = documentRef.querySelector<HTMLMetaElement>(
    THEME_COLOR_META_SELECTOR,
  )

  if (themeColorMeta) {
    themeColorMeta.content = THEME_COLORS[theme]
  }
}

/**
 * Inline bootstrap script that applies theme before the first stylesheet paint.
 */
export const THEME_INIT_SCRIPT = `(function(){var attribute='${THEME_ATTRIBUTE}';var storageKey='${THEME_STORAGE_KEY}';var mediaQuery='${THEME_MEDIA_QUERY}';var themeColors={light:'${THEME_COLORS.light}',dark:'${THEME_COLORS.dark}'};var root=document.documentElement;var themeColorMeta=document.querySelector('meta[name="theme-color"]');var isTheme=function(value){return value==='light'||value==='dark';};var readStoredTheme=function(){var storedTheme=window.localStorage.getItem(storageKey);return isTheme(storedTheme)?storedTheme:null;};var resolveSystemTheme=function(mediaQueryList){return mediaQueryList.matches?'dark':'light';};var applyTheme=function(theme){root.setAttribute(attribute,theme);root.style.colorScheme=theme;if(themeColorMeta){themeColorMeta.content=themeColors[theme];}};var resolvePreferredTheme=function(){var storedTheme=readStoredTheme();if(storedTheme){return storedTheme;}return resolveSystemTheme(window.matchMedia(mediaQuery));};applyTheme(resolvePreferredTheme());var mediaQueryList=window.matchMedia(mediaQuery);var handleSystemThemeChange=function(event){if(readStoredTheme()){return;}applyTheme(resolveSystemTheme(event));};if(mediaQueryList.addEventListener){mediaQueryList.addEventListener('change',handleSystemThemeChange);return;}if(mediaQueryList.addListener){mediaQueryList.addListener(handleSystemThemeChange);}})();`
