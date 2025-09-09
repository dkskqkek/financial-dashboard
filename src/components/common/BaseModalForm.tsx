import React, { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UI_TEXT, UI_STYLES } from '@/constants/ui'
import { useFormState, useModal } from '@/hooks'

export interface BaseModalFormProps<T> {
  title: string
  description?: string
  triggerButton: ReactNode
  initialData: T
  onSubmit: (data: T) => Promise<void> | void
  onReset?: () => void
  submitLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  children: (props: {
    formData: T
    setFormData: (data: T) => void
    updateField: (field: keyof T, value: T[keyof T]) => void
  }) => ReactNode
}

export function BaseModalForm<T extends Record<string, any>>({
  title,
  description,
  triggerButton,
  initialData,
  onSubmit,
  onReset,
  submitLabel = UI_TEXT.SAVE,
  cancelLabel = UI_TEXT.CANCEL,
  isLoading = false,
  children,
}: BaseModalFormProps<T>) {
  const { isOpen, closeModal, setIsOpen } = useModal({
    onClose: onReset
  })
  
  const { formData, setFormData, updateField, resetForm } = useFormState({
    initialData,
    onReset
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      handleClose()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleClose = () => {
    closeModal()
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleClose()
      } else {
        setIsOpen(newOpen)
      }
    }}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      
      <DialogContent className={`${UI_STYLES.MODAL_MD} max-h-[80vh] overflow-auto`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className={UI_STYLES.FORM_SPACING}>
          {children({ formData, setFormData, updateField })}
          
          <div className={UI_STYLES.BUTTON_GROUP_END}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? UI_TEXT.SAVING : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}