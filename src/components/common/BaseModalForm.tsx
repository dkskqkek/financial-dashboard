import React, { useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'

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
  submitLabel = '저장',
  cancelLabel = '취소',
  isLoading = false,
  children,
}: BaseModalFormProps<T>) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<T>(initialData)

  const updateField = (field: keyof T, value: T[keyof T]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
    setOpen(false)
    setFormData(initialData)
    onReset?.()
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleClose()
      } else {
        setOpen(newOpen)
      }
    }}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {children({ formData, setFormData, updateField })}
          
          <div className="flex justify-end space-x-2 pt-4">
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
              {isLoading ? '저장 중...' : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}