import type { BackupData, BackupStorageProvider } from '../types'

export class IndexedDBProvider implements BackupStorageProvider {
  readonly name = 'indexedDB'
  private readonly dbName = 'FinancialBackupDB'
  private readonly version = 1
  private readonly storeName = 'backups'

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      
      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('reason', 'reason', { unique: false })
        }
      }
      
      request.onsuccess = () => resolve(request.result)
    })
  }

  async save(key: string, data: BackupData): Promise<boolean> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      // key를 id로 사용
      const backupWithKey = { ...data, id: key }
      
      return new Promise((resolve, reject) => {
        const request = store.put(backupWithKey)
        
        request.onsuccess = () => {
          console.log(`✅ IndexedDB 저장 완료: ${key}`)
          resolve(true)
        }
        
        request.onerror = () => {
          console.error(`❌ IndexedDB 저장 실패: ${key}`, request.error)
          reject(false)
        }
      })
    } catch (error) {
      console.error(`❌ IndexedDB 저장 실패: ${key}`, error)
      return false
    }
  }

  async load(key: string): Promise<BackupData | null> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.get(key)
        
        request.onsuccess = () => {
          const result = request.result
          if (result) {
            console.log(`✅ IndexedDB 로드 완료: ${key}`)
            resolve(result)
          } else {
            resolve(null)
          }
        }
        
        request.onerror = () => {
          console.error(`❌ IndexedDB 로드 실패: ${key}`, request.error)
          reject(null)
        }
      })
    } catch (error) {
      console.error(`❌ IndexedDB 로드 실패: ${key}`, error)
      return null
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.delete(key)
        
        request.onsuccess = () => {
          console.log(`✅ IndexedDB 삭제 완료: ${key}`)
          resolve(true)
        }
        
        request.onerror = () => {
          console.error(`❌ IndexedDB 삭제 실패: ${key}`, request.error)
          reject(false)
        }
      })
    } catch (error) {
      console.error(`❌ IndexedDB 삭제 실패: ${key}`, error)
      return false
    }
  }

  async list(): Promise<string[]> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.getAllKeys()
        
        request.onsuccess = () => {
          resolve(request.result as string[])
        }
        
        request.onerror = () => {
          console.error('❌ IndexedDB 목록 조회 실패:', request.error)
          reject([])
        }
      })
    } catch (error) {
      console.error('❌ IndexedDB 목록 조회 실패:', error)
      return []
    }
  }

  async clear(): Promise<boolean> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.clear()
        
        request.onsuccess = () => {
          console.log('✅ IndexedDB 전체 삭제 완료')
          resolve(true)
        }
        
        request.onerror = () => {
          console.error('❌ IndexedDB 전체 삭제 실패:', request.error)
          reject(false)
        }
      })
    } catch (error) {
      console.error('❌ IndexedDB 전체 삭제 실패:', error)
      return false
    }
  }

  async getSize(): Promise<number> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      
      return new Promise((resolve, reject) => {
        const request = store.getAll()
        
        request.onsuccess = () => {
          const records = request.result
          let totalSize = 0
          
          records.forEach(record => {
            totalSize += new Blob([JSON.stringify(record)]).size
          })
          
          resolve(totalSize)
        }
        
        request.onerror = () => {
          console.error('❌ IndexedDB 크기 계산 실패:', request.error)
          reject(0)
        }
      })
    } catch (error) {
      console.error('❌ IndexedDB 크기 계산 실패:', error)
      return 0
    }
  }
}