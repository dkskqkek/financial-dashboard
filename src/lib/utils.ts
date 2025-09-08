import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { exchangeRateService } from '@/services/exchangeRateService'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 환율 변환을 포함한 통화 포맷팅
export async function formatCurrencyWithRate(
  amount: number,
  currency: string = 'KRW',
  displayCurrency: string = 'KRW'
): Promise<string> {
  let convertedAmount = amount

  // USD → KRW 변환이 필요한 경우
  if (currency === 'USD' && displayCurrency === 'KRW') {
    convertedAmount = await exchangeRateService.convertUsdToKrw(amount)
  }

  const formatter = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: displayCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(convertedAmount)
}

// 기존 formatCurrency (동기식, 환율 변환 없음)
// 포맷터 캐싱을 위한 Map
const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${currency}-${JSON.stringify(options)}`
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...options,
      })
    )
  }
  return formatterCache.get(key)!
}

export function formatCurrency(amount: number, currency: string = 'KRW'): string {
  if (!isFinite(amount) || isNaN(amount)) {
    return '₩0'
  }
  return getFormatter(currency).format(amount)
}

// 환율 변환만 수행하는 함수
export async function convertToKrw(amount: number, fromCurrency: string): Promise<number> {
  if (fromCurrency === 'KRW') {
    return amount
  }
  if (fromCurrency === 'USD') {
    return await exchangeRateService.convertUsdToKrw(amount)
  }
  return amount
}

export function formatNumber(num: number, decimals: number = 0): string {
  if (!isFinite(num) || isNaN(num)) {
    return '0'
  }
  return getFormatter('KRW', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100
}

export function calculateChange(
  current: number,
  previous: number
): {
  amount: number
  percentage: number
} {
  const amount = current - previous
  const percentage = previous !== 0 ? (amount / previous) * 100 : 0
  return { amount, percentage }
}

export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) {
    return accountNumber
  }
  return accountNumber.slice(0, 4) + '*'.repeat(accountNumber.length - 8) + accountNumber.slice(-4)
}

export function getColorByValue(value: number): string {
  if (value > 0) {
    return 'text-success'
  }
  if (value < 0) {
    return 'text-destructive'
  }
  return 'text-muted-foreground'
}

export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 메모이제이션 함수
export function memoize<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  getKey?: (...args: TArgs) => string
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>()

  return (...args: TArgs): TReturn => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// 비용이 많이 드는 계산 메모이제이션
export const memoizedCalculateChange = memoize(
  (current: number, previous: number) => calculateChange(current, previous),
  (current, previous) => `${current}-${previous}`
)

export const memoizedCalculateCAGR = memoize(
  (startValue: number, endValue: number, years: number) => calculateCAGR(startValue, endValue, years),
  (start, end, years) => `${start}-${end}-${years}`
)

export function convertCurrency(amount: number, fromRate: number, toRate: number): number {
  return (amount * fromRate) / toRate
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

// 지연 로딩을 위한 Promise 래퍼
export function createLazyPromise<T>(factory: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null

  return () => {
    if (!promise) {
      promise = factory()
    }
    return promise
  }
}

// 안전한 JSON 파싱
export function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// 복합 키 생성기
export function createCompoundKey(...parts: (string | number)[]): string {
  return parts.join('|')
}

// 깊은 비교 함수 (React.memo에 유용)
export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) {
    return true
  }
  if (a == null || b == null) {
    return false
  }
  if (typeof a !== 'object' || typeof b !== 'object') {
    return false
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false
    }
    if (!deepEqual((a as any)[key], (b as any)[key])) {
      return false
    }
  }

  return true
}
