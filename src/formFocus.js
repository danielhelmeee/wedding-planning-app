// Validation may happen below the fold on a phone. Bring the first problem back into view.
export function focusInvalid(form) {
  requestAnimationFrame(() => {
    if (!form?.isConnected) return
    const invalid = form.querySelector('[aria-invalid="true"]')
    const field = invalid?.matches('fieldset') ? invalid.querySelector('input') : invalid
    field?.focus({ preventScroll: true })
    field?.scrollIntoView({ block: 'center' })
  })
}
