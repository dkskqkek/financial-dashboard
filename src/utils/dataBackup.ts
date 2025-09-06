import { useAppStore } from '@/stores'

interface BackupData {
  timestamp: string
  version: string
  data: any
}

export class DataBackupService {
  private static readonly BACKUP_KEY = 'financial-dashboard-backup'
  private static readonly MAX_BACKUPS = 10 // 최대 10개 백업 보관
  
  // 현재 데이터를 로컬 스토리지에 백업
  static async createBackup(reason = 'manual'): Promise<boolean> {
    try {
      const store = useAppStore.getState()
      const currentData = useAppStore.persist.getOptions().partialize?.(store) || store
      
      const backup: BackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: currentData
      }
      
      // 기존 백업 목록 가져오기
      const existingBackups = this.getBackupList()
      
      // 새 백업 추가 (최신을 맨 앞에)
      const updatedBackups = [backup, ...existingBackups]
      
      // 최대 개수 제한
      if (updatedBackups.length > this.MAX_BACKUPS) {
        updatedBackups.splice(this.MAX_BACKUPS)
      }
      
      // 로컬 스토리지에 저장
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(updatedBackups))
      
      console.log(`✅ 데이터 백업 완료 (${reason}):`, backup.timestamp)
      return true
    } catch (error) {
      console.error('❌ 데이터 백업 실패:', error)
      return false
    }
  }
  
  // 백업 목록 조회
  static getBackupList(): BackupData[] {
    try {
      const backupsJson = localStorage.getItem(this.BACKUP_KEY)
      if (!backupsJson) return []
      
      const backups = JSON.parse(backupsJson)
      return Array.isArray(backups) ? backups : []
    } catch (error) {
      console.error('❌ 백업 목록 조회 실패:', error)
      return []
    }
  }
  
  // 특정 백업으로 복구
  static async restoreFromBackup(backupIndex: number): Promise<boolean> {
    try {
      const backups = this.getBackupList()
      if (backupIndex < 0 || backupIndex >= backups.length) {
        console.error('❌ 잘못된 백업 인덱스:', backupIndex)
        return false
      }
      
      const backup = backups[backupIndex]
      
      // 현재 데이터를 복구 전 백업으로 저장
      await this.createBackup('before_restore')
      
      // Zustand store에 백업 데이터 복원
      const storeName = useAppStore.persist.getOptions().name || 'financial-dashboard-store'
      localStorage.setItem(storeName, JSON.stringify({
        state: backup.data,
        version: 0
      }))
      
      console.log(`✅ 데이터 복구 완료:`, backup.timestamp)
      return true
    } catch (error) {
      console.error('❌ 데이터 복구 실패:', error)
      return false
    }
  }
  
  // 최신 백업으로 복구
  static async restoreLatestBackup(): Promise<boolean> {
    const backups = this.getBackupList()
    if (backups.length === 0) {
      console.warn('⚠️ 복구할 백업이 없습니다')
      return false
    }
    
    return await this.restoreFromBackup(0)
  }
  
  // 백업 삭제
  static deleteBackup(backupIndex: number): boolean {
    try {
      const backups = this.getBackupList()
      if (backupIndex < 0 || backupIndex >= backups.length) {
        return false
      }
      
      backups.splice(backupIndex, 1)
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups))
      
      console.log(`✅ 백업 삭제 완료: 인덱스 ${backupIndex}`)
      return true
    } catch (error) {
      console.error('❌ 백업 삭제 실패:', error)
      return false
    }
  }
  
  // 모든 백업 삭제
  static clearAllBackups(): boolean {
    try {
      localStorage.removeItem(this.BACKUP_KEY)
      console.log('✅ 모든 백업 삭제 완료')
      return true
    } catch (error) {
      console.error('❌ 백업 삭제 실패:', error)
      return false
    }
  }
  
  // 백업 내보내기 (JSON 파일로 다운로드)
  static exportBackup(backupIndex: number): void {
    try {
      const backups = this.getBackupList()
      if (backupIndex < 0 || backupIndex >= backups.length) {
        return
      }
      
      const backup = backups[backupIndex]
      const dataStr = JSON.stringify(backup, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `financial-backup-${backup.timestamp.substring(0, 19).replace(/[:.]/g, '-')}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      console.log(`✅ 백업 내보내기 완료: ${exportFileDefaultName}`)
    } catch (error) {
      console.error('❌ 백업 내보내기 실패:', error)
    }
  }
  
  // 백업 가져오기 (JSON 파일에서)
  static importBackup(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const backupData = JSON.parse(event.target?.result as string)
            
            // 백업 데이터 검증
            if (!backupData.timestamp || !backupData.data) {
              console.error('❌ 잘못된 백업 파일 형식')
              resolve(false)
              return
            }
            
            // 기존 백업 목록에 추가
            const existingBackups = this.getBackupList()
            const updatedBackups = [backupData, ...existingBackups]
            
            if (updatedBackups.length > this.MAX_BACKUPS) {
              updatedBackups.splice(this.MAX_BACKUPS)
            }
            
            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(updatedBackups))
            
            console.log(`✅ 백업 가져오기 완료: ${backupData.timestamp}`)
            resolve(true)
          } catch (error) {
            console.error('❌ 백업 파일 파싱 실패:', error)
            resolve(false)
          }
        }
        
        reader.readAsText(file)
      } catch (error) {
        console.error('❌ 백업 가져오기 실패:', error)
        resolve(false)
      }
    })
  }
}

// 자동 백업 설정
export const setupAutoBackup = () => {
  // 데이터가 변경될 때마다 자동 백업 (디바운스 적용)
  let backupTimeout: NodeJS.Timeout
  
  const scheduleBackup = () => {
    clearTimeout(backupTimeout)
    backupTimeout = setTimeout(() => {
      DataBackupService.createBackup('auto')
    }, 5000) // 5초 후 백업
  }
  
  // Zustand store 구독
  useAppStore.subscribe(() => {
    scheduleBackup()
  })
  
  console.log('🔄 자동 백업 시스템 활성화')
}