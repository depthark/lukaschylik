/**
 * JSON Schema object describing a tool's input.
 */
interface ToolInputSchema {
  type: 'object'
  properties: Record<string, unknown>
  required?: string[]
  additionalProperties?: boolean
}

/**
 * WebMCP tool annotations.
 * @see https://webmachinelearning.github.io/webmcp/#dictdef-toolannotations
 */
interface ToolAnnotations {
  /** The tool only reads data and never changes state */
  readOnlyHint?: boolean
  /** The tool returns content the site owner does not control */
  untrustedContentHint?: boolean
}

/**
 * MCP-compatible text result returned from a tool's `execute` callback.
 */
export interface ToolResult {
  content: { type: 'text'; text: string }[]
  isError?: boolean
}

/**
 * WebMCP tool dictionary accepted by `registerTool()`.
 * @see https://webmachinelearning.github.io/webmcp/#dictdef-modelcontexttool
 */
export interface ModelContextTool {
  name: string
  title?: string
  description: string
  inputSchema?: ToolInputSchema
  annotations?: ToolAnnotations
  execute: (input: Record<string, unknown>) => Promise<ToolResult>
}

/**
 * Producer surface of `document.modelContext`, plus the deprecated
 * `unregisterTool()` still exposed by early `navigator.modelContext` previews.
 */
interface ModelContext {
  registerTool(
    tool: ModelContextTool,
    options?: { signal?: AbortSignal },
  ): Promise<void> | void
  unregisterTool?(name: string): void
}

/**
 * Returns the WebMCP API of the current document, if the browser (or an
 * installed polyfill/extension) provides one. Prefers the standard
 * `document.modelContext` and falls back to the deprecated
 * `navigator.modelContext` of older Chromium previews.
 */
const getModelContext = (): ModelContext | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const documentContext = (document as Document & { modelContext?: unknown })
    .modelContext
  const navigatorContext = (navigator as Navigator & { modelContext?: unknown })
    .modelContext

  return (documentContext ?? navigatorContext ?? null) as ModelContext | null
}

/**
 * Removes a tool through the deprecated `unregisterTool()` API, used by
 * implementations that ignore the registration `signal`.
 * @param modelContext - Active WebMCP API
 * @param name - Tool name to remove
 */
const unregisterLegacyTool = (modelContext: ModelContext, name: string) => {
  try {
    modelContext.unregisterTool?.(name)
  } catch {
    return
  }
}

/**
 * Registers a single tool and ties its lifetime to the abort signal.
 * @param modelContext - Active WebMCP API
 * @param tool - Tool to expose
 * @param signal - Signal that removes the tool when aborted
 */
const registerTool = async (
  modelContext: ModelContext,
  tool: ModelContextTool,
  signal: AbortSignal,
) => {
  try {
    await modelContext.registerTool(tool, { signal })
    signal.addEventListener(
      'abort',
      () => unregisterLegacyTool(modelContext, tool.name),
      { once: true },
    )
  } catch (error) {
    if (!signal.aborted) {
      console.warn(`WebMCP: failed to register tool "${tool.name}"`, error)
    }
  }
}

/**
 * Exposes the given tools to in-browser AI agents through WebMCP.
 * Does nothing when the browser has no WebMCP support.
 * @param tools - Tools to register
 * @param signal - Signal that unregisters all tools when aborted
 * @returns Whether WebMCP is available in this browser
 */
export const registerTools = (
  tools: ModelContextTool[],
  signal: AbortSignal,
): boolean => {
  const modelContext = getModelContext()
  if (!modelContext) {
    return false
  }

  tools.forEach((tool) => void registerTool(modelContext, tool, signal))

  return true
}

/**
 * Builds a successful text result. Non-string data is serialized as JSON.
 * @param data - Result payload
 */
export const ok = (data: unknown): ToolResult => ({
  content: [
    {
      type: 'text',
      text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    },
  ],
})

/**
 * Builds an error text result the agent can recover from.
 * @param message - Explanation of what went wrong
 */
export const fail = (message: string): ToolResult => ({
  content: [{ type: 'text', text: message }],
  isError: true,
})
