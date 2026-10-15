import '@qwik.dev/core'

declare module '@qwik.dev/core' {
  /**
   * Declarative WebMCP attributes for forms and their fields.
   * @see https://github.com/webmachinelearning/webmcp
   */
  interface HTMLElementAttrs {
    /** Tool name of a form exposed to AI agents */
    toolname?: string
    /** Tool description of a form exposed to AI agents */
    tooldescription?: string
    /** Submit the form automatically when an agent invokes the tool */
    toolautosubmit?: boolean
    /** Parameter title of a form field for AI agents */
    toolparamtitle?: string
    /** Parameter description of a form field for AI agents */
    toolparamdescription?: string
  }
}
