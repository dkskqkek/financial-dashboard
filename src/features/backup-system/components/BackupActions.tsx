import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Upload, RefreshCw } from 'lucide-react'

interface BackupActionsProps {
  onCreateBackup: () => void
  onImportBackup: (file: File) => void
  onRefresh: () => void
  isLoading: boolean
}

export function BackupActions({ onCreateBackup, onImportBackup, onRefresh, isLoading }: BackupActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImportBackup(file)
    }
    // Reset input value to allow same file selection
    event.target.value = ''
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={onCreateBackup} 
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        백업 생성
      </Button>
      
      <Button 
        variant="outline"
        onClick={handleImportClick}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        백업 가져오기
      </Button>
      
      <Button 
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        새로고침
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  )
}