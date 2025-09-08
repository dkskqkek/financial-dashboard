import type { BackupData, BackupStorageProvider } from '../types'

export class LocalStorageProvider implements BackupStorageProvider {
  readonly name = 'localStorage'

  async save(key: string, data: BackupData): Promise<boolean> {
    try {
      const serializedData = JSON.stringify(data)
      localStorage.setItem(key, serializedData)
      console.log(`✅ LocalStorage 저장 완료: ${key}`)
      return true
    } catch (error) {
      console.error(`❌ LocalStorage 저장 실패: ${key}`, error)
      return false
    }
  }

  async load(key: string): Promise<BackupData | null> {
    try {
      const serializedData = localStorage.getItem(key)
      if (!serializedData) return null
      
      const data = JSON.parse(serializedData)
      console.log(`✅ LocalStorage 로드 완료: ${key}`)
      return data
    } catch (error) {
      console.error(`❌ LocalStorage 로드 실패: ${key}`, error)
      return null
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(key)
      console.log(`✅ LocalStorage 삭제 완료: ${key}`)
      return true
    } catch (error) {
      console.error(`❌ LocalStorage 삭제 실패: ${key}`, error)
      return false
    }
  }

  async list(): Promise<string[]> {
    try {
      return Object.keys(localStorage).filter(key => key.startsWith('financial-'))
    } catch (error) {
      console.error('❌ LocalStorage 목록 조회 실패:', error)
      return []
    }
  }

  async clear(): Promise<boolean> {
    try {
      const keys = await this.list()
      keys.forEach(key => localStorage.removeItem(key))
      console.log('✅ LocalStorage 전체 삭제 완료')
      return true
    } catch (error) {
      console.error('❌ LocalStorage 전체 삭제 실패:', error)
      return false
    }
  }

  async getSize(): Promise<number> {
    try {
      let totalSize = 0
      const keys = await this.list()
      
      keys.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += new Blob([value]).size
        }
      })
      
      return totalSize
    } catch (error) {
      console.error('❌ LocalStorage 크기 계산 실패:', error)
      return 0
    }
  }
}