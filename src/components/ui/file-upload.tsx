import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileUpload?: (data: any) => void
  className?: string
}

export function FileUpload({ onFileUpload, className }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) {
        return
      }

      setUploading(true)
      setUploadStatus('idle')
      setUploadedFile(file)
      setErrorMessage('')

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('http://localhost:3007/api/data/upload', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          setUploadStatus('success')
          onFileUpload?.(result.data)
        } else {
          setUploadStatus('error')
          setErrorMessage(result.error || '업로드 실패')
        }
      } catch (error) {
        setUploadStatus('error')
        setErrorMessage(error instanceof Error ? error.message : '업로드 중 오류 발생')
      } finally {
        setUploading(false)
      }
    },
    [onFileUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'text/html': ['.html'],
      'application/octet-stream': ['.xlsx', '.xls', '.csv', '.html'],
    },
    maxFiles: 1,
  })

  const resetUpload = () => {
    setUploadedFile(null)
    setUploadStatus('idle')
    setErrorMessage('')
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
            uploading && 'pointer-events-none opacity-50'
          )}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            <div className="flex justify-center">
              {uploadStatus === 'success' ? (
                <Check className="h-12 w-12 text-green-500" />
              ) : uploadStatus === 'error' ? (
                <X className="h-12 w-12 text-red-500" />
              ) : uploading ? (
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              {uploading ? (
                <p className="text-lg font-medium">파일 업로드 중...</p>
              ) : uploadStatus === 'success' ? (
                <div className="space-y-1">
                  <p className="text-lg font-medium text-green-600">업로드 완료!</p>
                  <p className="text-sm text-muted-foreground">{uploadedFile?.name}</p>
                </div>
              ) : uploadStatus === 'error' ? (
                <div className="space-y-1">
                  <p className="text-lg font-medium text-red-600">업로드 실패</p>
                  <p className="text-sm text-red-500">{errorMessage}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg font-medium">
                    {isDragActive ? '파일을 여기에 놓아주세요' : '금융 데이터 파일을 업로드하세요'}
                  </p>
                  <p className="text-sm text-muted-foreground">.xlsx, .xls, .csv, .html 파일 지원 (최대 10MB)</p>
                </div>
              )}
            </div>

            {uploadedFile && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{uploadedFile.name}</span>
                <span>({Math.round(uploadedFile.size / 1024)} KB)</span>
              </div>
            )}

            {!uploading && (uploadStatus === 'success' || uploadStatus === 'error') && (
              <Button
                variant="outline"
                size="sm"
                onClick={e => {
                  e.stopPropagation()
                  resetUpload()
                }}
              >
                다시 업로드
              </Button>
            )}
          </div>
        </div>

        {uploadStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ 데이터가 성공적으로 처리되었습니다. 대시보드에서 확인하실 수 있습니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
