'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { toast } from '@/components/ui/Toast'

const ConfirmContext = createContext(null)

export function notifyToast(title, type = 'info', description) {
  toast.add({ title, type, description, timeout: 4500 })
}

function ConfirmationDialog({ options, onFinish }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const element = dialogRef.current
    if (element && !element.open) element.showModal()
    return () => {
      if (element?.open) element.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="confirm-dialog"
      onCancel={(event) => {
        event.preventDefault()
        onFinish(false)
      }}
    >
      <h2 id="confirm-dialog-title">{options.title}</h2>
      <p id="confirm-dialog-description">{options.description}</p>
      <div className="confirm-dialog-actions">
        <button type="button" className="btn-secondary" onClick={() => onFinish(false)}>
          {options.cancelLabel || 'Cancel'}
        </button>
        <button
          type="button"
          className={options.danger ? 'btn-danger' : 'btn-primary'}
          onClick={() => onFinish(true)}
        >
          {options.confirmLabel || 'Continue'}
        </button>
      </div>
    </dialog>
  )
}

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const confirm = useCallback((options) => new Promise((resolve) => {
    setDialog({ ...options, resolve })
  }), [])

  const finish = (accepted) => {
    dialog?.resolve(accepted)
    setDialog(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <ConfirmationDialog options={dialog} onFinish={finish} />
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return confirm
}
