import { useEffect } from 'react'

// A short message at the bottom of the screen, with Undo when the action can be taken back.
// `toast` = { id, text, undo? }; it closes itself after 6 seconds.
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [toast, onClose])
  if (!toast) return null
  return (
    <div className="toast" role="status" key={toast.id}>
      <span>{toast.text}</span>
      {toast.undo && (
        <button
          type="button"
          onClick={() => {
            toast.undo()
            onClose()
          }}
        >
          Undo
        </button>
      )}
    </div>
  )
}
