import React from 'react'
import { Button } from '@/components/ui/button'

interface QuickActionButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({ onClick, icon, label }) => {
  return (
    <Button
      variant="outline"
      className="mobile-button h-16 sm:h-20 flex-col hover:bg-primary/10 transition-colors touch-target"
      onClick={onClick}
    >
      {icon}
      <span className="text-xs sm:text-sm mobile-text-wrap">{label}</span>
    </Button>
  )
}
