import { createContextId, type QRL, type Signal } from '@qwik.dev/core'

/**
 * Context for managing the global reservation dialog
 */
export interface DialogContextValue {
  dialogRef: Signal<HTMLDialogElement | undefined>
  showDialog: QRL<() => void>
  hideDialog: QRL<() => void>
}

export const DialogContext =
  createContextId<DialogContextValue>('dialog-context')
