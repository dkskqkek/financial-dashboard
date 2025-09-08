import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, Trash2 } from 'lucide-react'
import type { BackupData } from '../types'

interface BackupListProps {
  backups: BackupData[]
  onRestore: (backupId: string) => void
  onDelete: (backupId: string) => void
  onExport: (backup: BackupData) => void
  isLoading: boolean
}

export function BackupList({ backups, onRestore, onDelete, onExport, isLoading }: BackupListProps) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR')
  }

  const formatSize = (size?: number) => {
    if (!size) return '알 수 없음'
    const kb = size / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const getReasonBadge = (reason?: BackupData['reason']) => {
    const variants = {
      manual: 'default',
      auto: 'secondary',
      daily: 'outline',
      weekly: 'destructive',
      monthly: 'default',
      emergency: 'destructive',
    } as const

    const labels = {
      manual: '수동',
      auto: '자동',
      daily: '일일',
      weekly: '주간',
      monthly: '월간',
      emergency: '긴급',
    } as const

    return (
      <Badge variant={variants[reason || 'manual']}>
        {labels[reason || 'manual']}
      </Badge>
    )
  }

  if (backups.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">백업이 없습니다</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {backups.map((backup) => (
        <Card key={backup.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {formatTimestamp(backup.timestamp)}
                  </span>
                  {getReasonBadge(backup.reason)}
                  {backup.locked && <Badge variant="destructive">잠금</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">
                  크기: {formatSize(backup.size)} | 버전: {backup.version}
                  {backup.compressed && ' | 압축됨'}
                </div>
                <div className="text-xs text-muted-foreground">
                  ID: {backup.id}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExport(backup)}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRestore(backup.id)}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                {!backup.locked && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(backup.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}