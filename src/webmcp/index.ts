import { $, useOnDocument } from '@qwik.dev/core'
import { registerTools } from './model-context'
import { createWebMcpTools, type WebMcpActions } from './tools'

const WEBMCP_READY = 'webmcp-ready'

/**
 * Inline head script that signals WebMCP support after the page has loaded.
 * Browsers without `modelContext` never fire the event, so they never
 * download any of the imperative tool code.
 */
export const WEBMCP_DETECT_SCRIPT = `if(document.modelContext||navigator.modelContext)addEventListener('load',function(){document.dispatchEvent(new Event('${WEBMCP_READY}'))})`

let registered = false

/**
 * Exposes the site's WebMCP tools to in-browser AI agents. The tool code is
 * loaded lazily on the `webmcp-ready` document event emitted by
 * {@link WEBMCP_DETECT_SCRIPT}, keeping it off the critical path.
 * @param actions - Site actions (QRLs) the tools delegate to
 */
export const useWebMcp = (actions: WebMcpActions) => {
  useOnDocument(
    WEBMCP_READY,
    $(() => {
      if (registered) return
      registered = true
      registerTools(createWebMcpTools(actions), new AbortController().signal)
    }),
  )
}
