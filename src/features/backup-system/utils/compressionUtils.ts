export class CompressionUtils {
  // 데이터 압축 (간단한 JSON 압축)
  static compressData(data: any): string {
    const jsonStr = JSON.stringify(data)
    
    // 단순 압축: 반복되는 키 압축
    const compressed = jsonStr
      .replace(/"timestamp"/g, '"t"')
      .replace(/"version"/g, '"v"')
      .replace(/"data"/g, '"d"')
      .replace(/"hash"/g, '"h"')
      .replace(/"locked"/g, '"l"')
      .replace(/"reason"/g, '"r"')
    
    return compressed
  }

  // 데이터 압축 해제
  static decompressData(compressedStr: string): any {
    // 압축 해제: 키 복원
    const decompressed = compressedStr
      .replace(/"t"/g, '"timestamp"')
      .replace(/"v"/g, '"version"')
      .replace(/"d"/g, '"data"')
      .replace(/"h"/g, '"hash"')
      .replace(/"l"/g, '"locked"')
      .replace(/"r"/g, '"reason"')
    
    return JSON.parse(decompressed)
  }

  // 파일 크기 계산
  static calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size
  }

  // 압축률 계산
  static getCompressionRatio(original: any, compressed: string): number {
    const originalSize = this.calculateSize(original)
    const compressedSize = new Blob([compressed]).size
    return Math.round(((originalSize - compressedSize) / originalSize) * 100)
  }
}