import { useState, useEffect } from 'react'
import { BackupOrchestrator } from '../services/backupOrchestrator'
import type { BackupData, BackupManagerState, BackupOperationResult } from '../types'

export function useBackupManager() {
  const [state, setState] = useState<BackupManagerState>({
    backups: [],
    dailyBackups: [],
    isLoading: false,
    activeTab: 'auto',
    lastBackupTime: null,
    autoBackupEnabled: true,
    schedule: {
      type: 'interval',
      intervalMinutes: 5,
      enabled: true,
    },
  })

  const orchestrator = new BackupOrchestrator()

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }

  const setActiveTab = (tab: BackupManagerState['activeTab']) => {
    setState(prev => ({ ...prev, activeTab: tab }))
  }

  const refreshBackups = async () => {
    try {
      setLoading(true)
      
      const [basicBackups, dailyBackups, secureBackups] = await Promise.all([
        orchestrator.getBackupList('basic'),
        orchestrator.getBackupList('daily'),
        orchestrator.getBackupList('secure'),
      ])

      setState(prev => ({
        ...prev,
        backups: [...basicBackups, ...secureBackups].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
        dailyBackups,
        lastBackupTime: basicBackups[0]?.timestamp || null,
      }))
    } catch (error) {
      console.error('❌ 백업 목록 새로고침 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async (
    strategy: string = 'basic',
    reason: BackupData['reason'] = 'manual'
  ): Promise<BackupOperationResult> => {
    try {
      setLoading(true)
      const result = await orchestrator.createBackup(strategy, reason)
      
      if (result.success) {
        await refreshBackups()
        setState(prev => ({ 
          ...prev, 
          lastBackupTime: new Date().toISOString() 
        }))
      }
      
      return result
    } catch (error) {
      console.error('❌ 백업 생성 실패:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '백업 생성 실패' 
      }
    } finally {
      setLoading(false)
    }
  }

  const restoreBackup = async (
    backupId: string,
    strategy: string = 'basic'
  ): Promise<BackupOperationResult> => {
    try {
      setLoading(true)
      const result = await orchestrator.restoreFromBackup(backupId, strategy)
      return result
    } catch (error) {
      console.error('❌ 백업 복원 실패:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '백업 복원 실패' 
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteBackup = async (
    backupId: string,
    strategy: string = 'basic'
  ): Promise<BackupOperationResult> => {
    try {
      setLoading(true)
      const result = await orchestrator.deleteBackup(backupId, strategy)
      
      if (result.success) {
        await refreshBackups()
      }
      
      return result
    } catch (error) {
      console.error('❌ 백업 삭제 실패:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '백업 삭제 실패' 
      }
    } finally {
      setLoading(false)
    }
  }

  const exportBackup = (backup: BackupData, filename?: string) => {
    try {
      orchestrator.exportBackup(backup, filename)
      return { success: true, message: '백업 내보내기 완료' }
    } catch (error) {
      console.error('❌ 백업 내보내기 실패:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '백업 내보내기 실패' 
      }
    }
  }

  const importBackup = async (
    file: File,
    strategy: string = 'basic'
  ): Promise<BackupOperationResult> => {
    try {
      setLoading(true)
      const result = await orchestrator.importBackup(file, strategy)
      
      if (result.success) {
        await refreshBackups()
      }
      
      return result
    } catch (error) {
      console.error('❌ 백업 가져오기 실패:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '백업 가져오기 실패' 
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleAutoBackup = () => {
    setState(prev => ({
      ...prev,
      autoBackupEnabled: !prev.autoBackupEnabled,
      schedule: {
        ...prev.schedule,
        enabled: !prev.autoBackupEnabled,
      },
    }))
  }

  // 초기 백업 목록 로드
  useEffect(() => {
    refreshBackups()
  }, [])

  return {
    ...state,
    // Actions
    refreshBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    exportBackup,
    importBackup,
    toggleAutoBackup,
    setActiveTab,
    setLoading,
  }
}