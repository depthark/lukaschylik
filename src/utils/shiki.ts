import {
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
  type HighlighterGeneric,
} from 'shiki'
import { SHIKI_CONFIG } from './shiki-config'

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null
let highlighterPromise: Promise<
  HighlighterGeneric<BundledLanguage, BundledTheme>
> | null = null

/**
 * Initialize Shiki highlighter with GitHub themes
 */
const initHighlighter = async () => {
  if (highlighter) {
    return highlighter
  }

  if (!highlighterPromise) {
    highlighterPromise = createHighlighter(SHIKI_CONFIG).then((hl) => {
      highlighter = hl
      return hl
    })
  }

  return highlighterPromise
}

/**
 * Highlight code with Shiki dual themes — renders both light/dark via CSS, switches instantly with color-scheme
 */
export const highlightCode = async (code: string, language: string) => {
  const hl = await initHighlighter()

  try {
    const html = hl.codeToHtml(code, {
      lang: language as BundledLanguage,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    })

    return html
  } catch (error) {
    console.warn(`Failed to highlight code with language "${language}":`, error)
    return `<pre><code class="language-${language}">${code}</code></pre>`
  }
}
