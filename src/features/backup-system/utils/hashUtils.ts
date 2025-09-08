export class HashUtils {
  // 데이터 해시 생성 (무결성 검증용)
  static generateHash(data: any): string {
    const str = JSON.stringify(data, Object.keys(data).sort())
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 32bit 정수로 변환
    }
    return hash.toString(36)
  }

  // 해시 검증
  static verifyHash(data: any, expectedHash: string): boolean {
    const actualHash = this.generateHash(data)
    return actualHash === expectedHash
  }

  // 고유 ID 생성
  static generateId(prefix = 'backup'): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 9)
    return `${prefix}_${timestamp}_${random}`
  }

  // 체크섬 생성 (추가 검증)
  static generateChecksum(str: string): string {
    let checksum = 0
    for (let i = 0; i < str.length; i++) {
      checksum = (checksum + str.charCodeAt(i)) % 65536
    }
    return checksum.toString(16).padStart(4, '0')
  }
}