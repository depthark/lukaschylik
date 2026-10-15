import { sync$ } from '@qwik.dev/core'

/**
 * Synchronous submit handler for forms annotated as declarative WebMCP tools.
 * When an agent triggered the submission it hands the agent a promise that
 * settles once `resolveAgentSubmit()` reports the outcome for that form.
 * Must run synchronously, so it is a `sync$` handler placed before the
 * form's regular `onSubmit$` handler.
 */
export const bridgeAgentSubmit = sync$(
  (event: SubmitEvent, form: HTMLFormElement) => {
    const agentEvent = event as SubmitEvent & {
      agentInvoked?: boolean
      respondWith?: (response: Promise<unknown>) => void
    }
    if (!agentEvent.agentInvoked || !agentEvent.respondWith) {
      return
    }

    agentEvent.respondWith(
      new Promise((resolve) => {
        form.addEventListener(
          'webmcp:result',
          (resultEvent) => resolve((resultEvent as CustomEvent<string>).detail),
          { once: true },
        )
      }),
    )
  },
)

/**
 * Reports the outcome of a form submission to the agent that triggered it.
 * No-op for submissions made by the visitor.
 * @param form - Submitted form element
 * @param result - Outcome description for the agent
 */
export const resolveAgentSubmit = (form: HTMLFormElement, result: string) => {
  form.dispatchEvent(new CustomEvent('webmcp:result', { detail: result }))
}
