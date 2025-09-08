import { useAppStore } from '@/stores'
import type { 
  BackupData, 
  BackupStorageProvider, 
  BackupOperationResult, 
  BackupStrategy,
  BackupValidationResult 
} from '../types'
import { LocalStorageProvider } from './localStorageProvider'
import { IndexedDBProvider } from './indexedDBProvider'
import { HashUtils } from '../utils/hashUtils'
import { CompressionUtils } from '../utils/compressionUtils'

export class BackupOrchestrator {
  private providers: BackupStorageProvider[] = []
  private strategies: Map<string, BackupStrategy> = new Map()

  constructor() {
    this.providers = [
      new LocalStorageProvider(),
      new IndexedDBProvider(),
    ]

    this.initializeStrategies()
  }

  private initializeStrategies(): void {
    // 기본 백업 전략
    this.strategies.set('basic', {
      name: 'Basic Backup',
      description: '기본 로컬 백업 (localStorage)',
      maxBackups: 10,
      retentionDays: 7,
      autoBackup: true,
      compression: false,
      encryption: false,
    })

    // 보안 백업 전략
    this.strategies.set('secure', {
      name: 'Secure Backup',
      description: '다중 저장소 보안 백업 (localStorage + IndexedDB)',
      maxBackups: 50,
      retentionDays: 30,
      autoBackup: true,
      compression: true,
      encryption: false,
    })

    // 일일 백업 전략
    this.strategies.set('daily', {
      name: 'Daily Backup',
      description: '일일 백업 (매일 자정)',
      maxBackups: -1, // 무제한
      retentionDays: 365,
      autoBackup: false,
      compression: true,
      encryption: false,
    })
  }

  async createBackup(
    strategyName: string = 'basic',
    reason: BackupData['reason'] = 'manual'
  ): Promise<BackupOperationResult> {
    try {
      const strategy = this.strategies.get(strategyName)
      if (!strategy) {
        return { success: false, message: `Unknown strategy: ${strategyName}` }
      }

      console.log(`🔄 백업 생성 시작 (${strategy.name}):`, reason)

      // 현재 스토어 데이터 가져오기
      const store = useAppStore.getState()
      const currentData = useAppStore.persist.getOptions().partialize?.(store) || store

      // 백업 데이터 생성
      const backup: BackupData = {
        id: HashUtils.generateId('backup'),
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        data: currentData,
        hash: HashUtils.generateHash(currentData),
        locked: strategyName === 'secure',
        reason,
        size: CompressionUtils.calculateSize(currentData),
        compressed: strategy.compression,
      }

      // 압축 적용
      let serializedData = backup
      if (strategy.compression) {
        serializedData = {
          ...backup,
          data: CompressionUtils.compressData(backup.data),
        }
      }

      // 저장소별로 저장
      const savePromises = this.providers.map(provider => 
        this.saveToProvider(provider, backup.id, serializedData, strategyName)
      )

      const results = await Promise.allSettled(savePromises)
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length

      if (successCount === 0) {
        return { 
          success: false, 
          message: '모든 저장소에 백업 실패',
          errors: results.map(r => r.status === 'rejected' ? r.reason : '').filter(Boolean)
        }
      }

      // 백업 목록 업데이트
      await this.cleanupOldBackups(strategyName, strategy)

      console.log(`✅ 백업 생성 완료 (${successCount}/${this.providers.length} 저장소):`, backup.id)
      
      return { 
        success: true, 
        message: `백업 생성 완료 (${strategy.name})`,
        backupId: backup.id 
      }
    } catch (error) {
      console.error('❌ 백업 생성 실패:', error)
      return { 
        success: false, 
        message: `백업 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      }
    }
  }

  private async saveToProvider(
    provider: BackupStorageProvider,
    backupId: string,
    backup: BackupData,
    strategyName: string
  ): Promise<boolean> {
    const key = `${strategyName}-${backupId}`
    return await provider.save(key, backup)
  }

  async getBackupList(strategyName: string = 'basic'): Promise<BackupData[]> {
    try {
      const provider = this.providers[0] // Primary provider (localStorage)
      const keys = await provider.list()
      const strategyKeys = keys.filter(key => key.startsWith(`${strategyName}-`))

      const backups: BackupData[] = []
      
      for (const key of strategyKeys) {
        const backup = await provider.load(key)
        if (backup) {
          backups.push(backup)
        }
      }

      // 최신순 정렬
      return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error('❌ 백업 목록 조회 실패:', error)
      return []
    }
  }

  async restoreFromBackup(backupId: string, strategyName: string = 'basic'): Promise<BackupOperationResult> {
    try {
      console.log(`🔄 백업 복원 시작: ${backupId}`)

      // 복원 전 현재 상태 백업
      await this.createBackup('basic', 'emergency')

      let backup: BackupData | null = null

      // 모든 저장소에서 백업 찾기
      for (const provider of this.providers) {
        const key = `${strategyName}-${backupId}`
        backup = await provider.load(key)
        if (backup) {
          console.log(`📦 백업 발견 (${provider.name}): ${backupId}`)
          break
        }
      }

      if (!backup) {
        return { success: false, message: '백업을 찾을 수 없습니다.' }
      }

      // 백업 검증
      const validation = this.validateBackup(backup)
      if (!validation.isValid) {
        return { 
          success: false, 
          message: '백업 데이터가 손상되었습니다.',
          errors: validation.errors 
        }
      }

      // 압축 해제
      let restoredData = backup.data
      if (backup.compressed) {
        restoredData = CompressionUtils.decompressData(backup.data)
      }

      // 스토어 복원
      const storeName = useAppStore.persist.getOptions().name || 'financial-dashboard-store'
      
      localStorage.setItem(
        storeName,
        JSON.stringify({
          state: restoredData,
          version: 0,
        })
      )

      const setState = useAppStore.setState
      setState(restoredData)

      // 강제 리하이드레이션
      setTimeout(() => {
        useAppStore.persist.rehydrate()
      }, 100)

      console.log('✅ 백업 복원 완료:', backupId)
      return { 
        success: true, 
        message: '백업 복원 완료! 페이지를 새로고침해주세요.',
        backupId 
      }
    } catch (error) {
      console.error('❌ 백업 복원 실패:', error)
      return { 
        success: false, 
        message: `백업 복원 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      }
    }
  }

  async deleteBackup(backupId: string, strategyName: string = 'basic'): Promise<BackupOperationResult> {
    try {
      console.log(`🗑️ 백업 삭제 시작: ${backupId}`)

      const deletePromises = this.providers.map(provider => {
        const key = `${strategyName}-${backupId}`
        return provider.delete(key)
      })

      const results = await Promise.allSettled(deletePromises)
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length

      console.log(`✅ 백업 삭제 완료 (${successCount}/${this.providers.length} 저장소)`)
      
      return { 
        success: successCount > 0, 
        message: `백업 삭제 완료`,
        backupId 
      }
    } catch (error) {
      console.error('❌ 백업 삭제 실패:', error)
      return { 
        success: false, 
        message: `백업 삭제 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      }
    }
  }

  private validateBackup(backup: BackupData): BackupValidationResult {
    const result: BackupValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      dataIntegrityCheck: false,
      hashMatch: false,
    }

    // 필수 필드 검증
    if (!backup.id || !backup.timestamp || !backup.data) {
      result.errors.push('필수 필드가 누락되었습니다.')
      result.isValid = false
    }

    // 해시 검증
    if (backup.hash) {
      const actualData = backup.compressed ? 
        CompressionUtils.decompressData(backup.data) : 
        backup.data
      
      result.hashMatch = HashUtils.verifyHash(actualData, backup.hash)
      if (!result.hashMatch) {
        result.errors.push('데이터 해시가 일치하지 않습니다.')
        result.isValid = false
      }
    } else {
      result.warnings.push('해시 정보가 없습니다.')
    }

    result.dataIntegrityCheck = result.isValid && result.hashMatch

    return result
  }

  private async cleanupOldBackups(strategyName: string, strategy: BackupStrategy): Promise<void> {
    if (strategy.maxBackups === -1) return // 무제한인 경우 정리하지 않음

    try {
      const backups = await this.getBackupList(strategyName)
      
      // 최대 개수 초과 시 오래된 백업 삭제
      if (strategy.maxBackups && backups.length > strategy.maxBackups) {
        const toDelete = backups.slice(strategy.maxBackups)
        
        for (const backup of toDelete) {
          await this.deleteBackup(backup.id, strategyName)
        }
      }

      // 보관 기간 초과 백업 삭제
      if (strategy.retentionDays) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - strategy.retentionDays)
        
        const expiredBackups = backups.filter(
          backup => new Date(backup.timestamp) < cutoffDate
        )
        
        for (const backup of expiredBackups) {
          await this.deleteBackup(backup.id, strategyName)
        }
      }
    } catch (error) {
      console.error('❌ 백업 정리 실패:', error)
    }
  }

  // 백업 내보내기
  exportBackup(backup: BackupData, filename?: string): void {
    try {
      const exportData = {
        ...backup,
        exported: new Date().toISOString(),
        exportVersion: '2.0.0',
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

      const defaultFilename = `financial-backup-${backup.timestamp.replace(/[:.]/g, '-')}.json`
      
      const link = document.createElement('a')
      link.setAttribute('href', dataUri)
      link.setAttribute('download', filename || defaultFilename)
      link.click()

      console.log(`✅ 백업 내보내기 완료: ${filename || defaultFilename}`)
    } catch (error) {
      console.error('❌ 백업 내보내기 실패:', error)
    }
  }

  // 백업 가져오기
  async importBackup(file: File, strategyName: string = 'basic'): Promise<BackupOperationResult> {
    return new Promise(resolve => {
      try {
        const reader = new FileReader()
        
        reader.onload = async event => {
          try {
            const importedData = JSON.parse(event.target?.result as string)
            
            // 가져온 데이터 검증
            const validation = this.validateBackup(importedData)
            if (!validation.isValid) {
              resolve({ 
                success: false, 
                message: '잘못된 백업 파일 형식입니다.',
                errors: validation.errors 
              })
              return
            }

            // 새로운 ID로 저장 (중복 방지)
            const newBackup: BackupData = {
              ...importedData,
              id: HashUtils.generateId('imported'),
              reason: 'manual',
            }

            // 저장소에 저장
            const savePromises = this.providers.map(provider => 
              this.saveToProvider(provider, newBackup.id, newBackup, strategyName)
            )

            await Promise.all(savePromises)

            resolve({ 
              success: true, 
              message: '백업 가져오기 완료',
              backupId: newBackup.id 
            })
          } catch (error) {
            resolve({ 
              success: false, 
              message: '백업 파일 파싱 실패' 
            })
          }
        }

        reader.readAsText(file)
      } catch (error) {
        resolve({ 
          success: false, 
          message: '파일 읽기 실패' 
        })
      }
    })
  }
}