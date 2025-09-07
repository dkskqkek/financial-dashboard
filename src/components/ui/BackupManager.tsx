import React, { useState, useEffect } from 'react'
import { DataBackupService } from '@/utils/dataBackup'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Save,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Database,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface BackupData {
  timestamp: string
  version: string
  data: any
}

export function BackupManager() {
  const [backups, setBackups] = useState<BackupData[]>([])
  const [dailyBackups, setDailyBackups] = useState<BackupData[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'auto' | 'daily'>('auto')

  // 백업 목록 새로고침
  const refreshBackups = () => {
    const backupList = DataBackupService.getBackupList()
    const dailyBackupList = DataBackupService.getDailyBackupList()
    setBackups(backupList)
    setDailyBackups(dailyBackupList)
  }

  // 컴포넌트 마운트 시 백업 목록 로드
  useEffect(() => {
    refreshBackups()
  }, [isOpen])

  // 수동 백업 생성
  const handleCreateBackup = async () => {
    setIsLoading(true)
    try {
      const success = await DataBackupService.createBackup('manual')
      if (success) {
        refreshBackups()
        alert('✅ 백업이 생성되었습니다!')
      } else {
        alert('❌ 백업 생성에 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 백업 복구
  const handleRestore = async (index: number) => {
    if (!confirm('현재 데이터를 백업으로 복구하시겠습니까? (현재 데이터는 자동으로 백업됩니다)')) {
      return
    }

    setIsLoading(true)
    try {
      const success = await DataBackupService.restoreFromBackup(index)
      if (success) {
        alert('✅ 데이터가 복구되었습니다! 페이지를 새로고침합니다.')
        window.location.reload()
      } else {
        alert('❌ 데이터 복구에 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 백업 삭제
  const handleDelete = (index: number) => {
    if (!confirm('이 백업을 삭제하시겠습니까?')) {
      return
    }

    const success = DataBackupService.deleteBackup(index)
    if (success) {
      refreshBackups()
    } else {
      alert('❌ 백업 삭제에 실패했습니다.')
    }
  }

  // 백업 내보내기
  const handleExport = (index: number) => {
    DataBackupService.exportBackup(index)
  }

  // 백업 가져오기
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const success = await DataBackupService.importBackup(file)
      if (success) {
        refreshBackups()
        alert('✅ 백업을 가져왔습니다!')
      } else {
        alert('❌ 백업 파일을 가져오는데 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
      // input 초기화
      event.target.value = ''
    }
  }

  // 일일 백업 생성
  const handleCreateDailyBackup = async () => {
    setIsLoading(true)
    try {
      const success = await DataBackupService.createDailyBackup()
      if (success) {
        refreshBackups()
        alert('✅ 일일 백업이 생성되었습니다!')
      } else {
        alert('⚠️ 오늘의 일일 백업이 이미 존재합니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 일일 백업 복구
  const handleDailyRestore = async (index: number) => {
    if (!confirm('이 일일 백업으로 데이터를 복구하시겠습니까? (현재 데이터는 자동으로 백업됩니다)')) {
      return
    }

    setIsLoading(true)
    try {
      const success = await DataBackupService.restoreFromDailyBackup(index)
      if (success) {
        alert('✅ 일일 백업으로 데이터가 복구되었습니다! 페이지를 새로고침합니다.')
        window.location.reload()
      } else {
        alert('❌ 일일 백업 복구에 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 일일 백업 삭제
  const handleDailyDelete = (index: number) => {
    if (!confirm('이 일일 백업을 삭제하시겠습니까?')) {
      return
    }

    const success = DataBackupService.deleteDailyBackup(index)
    if (success) {
      refreshBackups()
    } else {
      alert('❌ 일일 백업 삭제에 실패했습니다.')
    }
  }

  // 일일 백업 내보내기
  const handleDailyExport = (index: number) => {
    DataBackupService.exportDailyBackup(index)
  }

  // 날짜 포맷팅
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR')
  }

  // 날짜만 포맷팅 (일일 백업용)
  const formatDateOnly = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('ko-KR')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Database className="h-4 w-4 mr-2" />
          데이터 백업
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            데이터 백업 관리
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 탭 네비게이션 */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'auto'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('auto')}
            >
              자동 백업
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'daily'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('daily')}
            >
              일일 백업
            </button>
          </div>

          {/* 자동 백업 탭 */}
          {activeTab === 'auto' && (
            <>
              {/* 백업 제어 버튼들 */}
              <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
            <Button 
              onClick={handleCreateBackup} 
              disabled={isLoading}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              수동 백업 생성
            </Button>
            
            <Button 
              onClick={refreshBackups} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                백업 파일 가져오기
              </Button>
            </div>
          </div>

          {/* 백업 안내 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                자동 백업 활성화
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>• 데이터 변경 후 5초마다 자동으로 백업됩니다</p>
              <p>• 최대 10개의 백업이 로컬에 보관됩니다</p>
              <p>• 복구 시 현재 데이터는 자동으로 백업됩니다</p>
            </CardContent>
          </Card>

          {/* 백업 목록 */}
          <div className="space-y-3">
            <h3 className="font-medium">백업 목록 ({backups.length}개)</h3>
            
            {backups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>저장된 백업이 없습니다</p>
                  <p className="text-xs mt-1">데이터를 입력하면 자동으로 백업됩니다</p>
                </CardContent>
              </Card>
            ) : (
              backups.map((backup, index) => (
                <Card key={`${backup.timestamp}-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            백업 #{backups.length - index}
                          </p>
                          {index === 0 && (
                            <Badge variant="secondary">최신</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(backup.timestamp)}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          버전: {backup.version || '1.0.0'}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(index)}
                          disabled={isLoading}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          복구
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(index)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          내보내기
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
            </>
          )}

          {/* 일일 백업 탭 */}
          {activeTab === 'daily' && (
            <>
              {/* 일일 백업 제어 버튼들 */}
              <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
                <Button 
                  onClick={handleCreateDailyBackup} 
                  disabled={isLoading}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  오늘 백업 생성
                </Button>
                
                <Button 
                  onClick={refreshBackups} 
                  variant="outline" 
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  새로고침
                </Button>
              </div>

              {/* 일일 백업 안내 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    일일 백업 시스템
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>• 매일 자정(00:00)에 자동으로 일일 백업이 생성됩니다</p>
                  <p>• 하루에 하나씩 백업되며, 저장 개수 제한이 없습니다</p>
                  <p>• 장기 보관용 백업으로 활용하세요</p>
                </CardContent>
              </Card>

              {/* 일일 백업 목록 */}
              <div className="space-y-3">
                <h3 className="font-medium">일일 백업 목록 ({dailyBackups.length}개)</h3>
                
                {dailyBackups.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>저장된 일일 백업이 없습니다</p>
                      <p className="text-xs mt-1">오늘 백업을 생성하거나 자정까지 기다려주세요</p>
                    </CardContent>
                  </Card>
                ) : (
                  dailyBackups.map((backup, index) => (
                    <Card key={`daily-${backup.timestamp}-${index}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {formatDateOnly(backup.timestamp)} 백업
                              </p>
                              {index === 0 && (
                                <Badge variant="secondary">최신</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              생성 시간: {formatDate(backup.timestamp)}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              버전: {backup.version || '1.0.0'}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDailyRestore(index)}
                              disabled={isLoading}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              복구
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDailyExport(index)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              내보내기
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDailyDelete(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}