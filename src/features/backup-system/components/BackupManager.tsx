import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Database } from 'lucide-react'
import { useBackupManager } from '../hooks/useBackupManager'
import { useBackupScheduler } from '../hooks/useBackupScheduler'
import { BackupList } from './BackupList'
import { BackupActions } from './BackupActions'
import { BackupStatus } from './BackupStatus'

export function BackupManager() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    backups,
    dailyBackups,
    isLoading,
    activeTab,
    lastBackupTime,
    autoBackupEnabled,
    schedule,
    refreshBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    exportBackup,
    importBackup,
    toggleAutoBackup,
    setActiveTab,
  } = useBackupManager()

  useBackupScheduler(schedule)

  const handleCreateBackup = async (strategy: string = 'basic') => {
    const result = await createBackup(strategy, 'manual')
    if (result.success) {
      alert('✅ 백업이 생성되었습니다!')
    } else {
      alert(`❌ 백업 생성 실패: ${result.message}`)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('백업을 복원하시겠습니까? 현재 데이터가 대체됩니다.')) {
      return
    }

    const strategy = activeTab === 'daily' ? 'daily' : 'basic'
    const result = await restoreBackup(backupId, strategy)
    
    if (result.success) {
      alert(result.message || '백업 복원 완료!')
      setIsOpen(false)
    } else {
      alert(`❌ 백업 복원 실패: ${result.message}`)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('백업을 삭제하시겠습니까?')) {
      return
    }

    const strategy = activeTab === 'daily' ? 'daily' : 'basic'
    const result = await deleteBackup(backupId, strategy)
    
    if (result.success) {
      alert('백업이 삭제되었습니다.')
    } else {
      alert(`❌ 백업 삭제 실패: ${result.message}`)
    }
  }

  const handleExportBackup = (backup: any) => {
    exportBackup(backup)
  }

  const handleImportBackup = async (file: File) => {
    const strategy = activeTab === 'daily' ? 'daily' : 'basic'
    const result = await importBackup(file, strategy)
    
    if (result.success) {
      alert('✅ 백업 가져오기 완료!')
    } else {
      alert(`❌ 백업 가져오기 실패: ${result.message}`)
    }
  }

  const getCurrentBackups = () => {
    switch (activeTab) {
      case 'daily':
        return dailyBackups
      case 'secure':
        return backups.filter(b => b.reason === 'weekly' || b.reason === 'monthly')
      case 'archive':
        return backups.filter(b => b.locked)
      default:
        return backups.filter(b => !b.locked && b.reason !== 'weekly' && b.reason !== 'monthly')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          백업 관리
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            통합 백업 관리 시스템
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <BackupStatus
            lastBackupTime={lastBackupTime}
            autoBackupEnabled={autoBackupEnabled}
            onToggleAutoBackup={toggleAutoBackup}
            totalBackups={backups.length}
            dailyBackups={dailyBackups.length}
          />

          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="auto">자동 백업</TabsTrigger>
              <TabsTrigger value="daily">일일 백업</TabsTrigger>
              <TabsTrigger value="secure">보안 백업</TabsTrigger>
              <TabsTrigger value="archive">아카이브</TabsTrigger>
            </TabsList>

            <TabsContent value="auto" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">자동 백업</CardTitle>
                  <BackupActions
                    onCreateBackup={() => handleCreateBackup('basic')}
                    onImportBackup={handleImportBackup}
                    onRefresh={refreshBackups}
                    isLoading={isLoading}
                  />
                </CardHeader>
                <CardContent>
                  <BackupList
                    backups={getCurrentBackups()}
                    onRestore={handleRestoreBackup}
                    onDelete={handleDeleteBackup}
                    onExport={handleExportBackup}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="daily" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">일일 백업</CardTitle>
                  <BackupActions
                    onCreateBackup={() => handleCreateBackup('daily')}
                    onImportBackup={handleImportBackup}
                    onRefresh={refreshBackups}
                    isLoading={isLoading}
                  />
                </CardHeader>
                <CardContent>
                  <BackupList
                    backups={getCurrentBackups()}
                    onRestore={handleRestoreBackup}
                    onDelete={handleDeleteBackup}
                    onExport={handleExportBackup}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="secure" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">보안 백업</CardTitle>
                  <BackupActions
                    onCreateBackup={() => handleCreateBackup('secure')}
                    onImportBackup={handleImportBackup}
                    onRefresh={refreshBackups}
                    isLoading={isLoading}
                  />
                </CardHeader>
                <CardContent>
                  <BackupList
                    backups={getCurrentBackups()}
                    onRestore={handleRestoreBackup}
                    onDelete={handleDeleteBackup}
                    onExport={handleExportBackup}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="archive" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">아카이브 백업</CardTitle>
                </CardHeader>
                <CardContent>
                  <BackupList
                    backups={getCurrentBackups()}
                    onRestore={handleRestoreBackup}
                    onDelete={handleDeleteBackup}
                    onExport={handleExportBackup}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}