import { ref } from 'vue'

/**
 * Validasi form ringan: rules berisi fungsi (values) => pesan error | ''.
 *
 * const { errors, validate, clear } = useFormValidation({
 *   name: (values) => (values.name ? '' : 'Wajib diisi')
 * })
 */
export function useFormValidation(rules = {}) {
  const errors = ref({})

  function setErrors(next = {}) {
    errors.value = { ...next }
  }

  function validate(values = {}) {
    const next = {}
    Object.entries(rules).forEach(([field, rule]) => {
      const message = typeof rule === 'function' ? rule(values) : ''
      if (message) next[field] = message
    })
    errors.value = next
    return Object.keys(next).length === 0
  }

  function clear(field) {
    if (field) {
      const next = { ...errors.value }
      delete next[field]
      errors.value = next
      return
    }
    errors.value = {}
  }

  return { errors, validate, setErrors, clear }
}
