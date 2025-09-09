import { useState, useCallback } from 'react'

export interface UseFormStateOptions<T> {
  initialData: T
  onReset?: () => void
}

export function useFormState<T extends Record<string, any>>({
  initialData,
  onReset
}: UseFormStateOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData)

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData(initialData)
    onReset?.()
  }, [initialData, onReset])

  const updateFormData = useCallback((newData: T) => {
    setFormData(newData)
  }, [])

  return {
    formData,
    setFormData: updateFormData,
    updateField,
    resetForm
  }
}