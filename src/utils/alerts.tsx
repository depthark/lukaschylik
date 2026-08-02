import { createContextId } from '@qwik.dev/core'

export interface AlertMessage {
  text: string
  visible: boolean
}

export const AlertContext = createContextId<{
  alertMessage: AlertMessage
  showAlert: (message: string) => void
  hideAlert: () => void
}>('alert-context')
