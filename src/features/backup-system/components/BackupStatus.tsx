import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'

interface BackupStatusProps {
  lastBackupTime: string | null
  autoBackupEnabled: boolean
  onToggleAutoBackup: () => void
  totalBackups: number
  dailyBackups: number
}

export function BackupStatus({ 
  lastBackupTime, 
  autoBackupEnabled, 
  onToggleAutoBackup,
  totalBackups,
  dailyBackups
}: BackupStatusProps) {
  const formatLastBackup = (timestamp: string | null) => {
    if (!timestamp) return '백업 없음'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return '방금 전'
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`
    return `${Math.floor(diffMinutes / 1440)}일 전`
  }

  const getBackupStatus = () => {
    if (!lastBackupTime) {
      return { icon: AlertTriangle, text: '백업 필요', variant: 'destructive' as const }
    }
    
    const diffMinutes = Math.floor((new Date().getTime() - new Date(lastBackupTime).getTime()) / (1000 * 60))
    
    if (diffMinutes < 30) {
      return { icon: CheckCircle, text: '정상', variant: 'default' as const }
    } else if (diffMinutes < 120) {
      return { icon: Clock, text: '주의', variant: 'secondary' as const }
    } else {
      return { icon: AlertTriangle, text: '백업 필요', variant: 'destructive' as const }
    }
  }

  const status = getBackupStatus()
  const StatusIcon = status.icon

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              <span className="font-medium">백업 상태</span>
              <Badge variant={status.variant}>{status.text}</Badge>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <div>마지막 백업: {formatLastBackup(lastBackupTime)}</div>
              <div>전체 백업: {totalBackups}개 | 일일 백업: {dailyBackups}개</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={autoBackupEnabled ? 'default' : 'secondary'}>
              자동 백업 {autoBackupEnabled ? '활성' : '비활성'}
            </Badge>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleAutoBackup}
            >
              {autoBackupEnabled ? '비활성화' : '활성화'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}