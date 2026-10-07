import { useVisibleTask$ } from '@qwik.dev/core'
import { registerTools } from './model-context'
import { createWebMcpTools, type WebMcpActions } from './tools'

/**
 * Exposes the site's WebMCP tools to in-browser AI agents for as long as the
 * calling component stays mounted. Runs on the client once the document is
 * ready and does nothing in browsers without `document.modelContext`.
 * @param actions - Site actions (QRLs) the tools delegate to
 */
export const useWebMcp = (actions: WebMcpActions) => {
  useVisibleTask$(
    ({ cleanup }) => {
      const controller = new AbortController()
      registerTools(createWebMcpTools(actions), controller.signal)
      cleanup(() => controller.abort())
    },
    { strategy: 'document-ready' },
  )
}
