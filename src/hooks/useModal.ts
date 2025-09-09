import { useState, useCallback } from 'react'

export interface UseModalOptions {
  defaultOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
}

export function useModal({
  defaultOpen = false,
  onOpen,
  onClose
}: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const openModal = useCallback(() => {
    setIsOpen(true)
    onOpen?.()
  }, [onOpen])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const toggleModal = useCallback(() => {
    if (isOpen) {
      closeModal()
    } else {
      openModal()
    }
  }, [isOpen, openModal, closeModal])

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen
  }
}