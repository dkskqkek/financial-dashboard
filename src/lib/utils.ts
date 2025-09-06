import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { exchangeRateService } from "@/services/exchangeRateService"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 환율 변환을 포함한 통화 포맷팅
export async function formatCurrencyWithRate(
  amount: number, 
  currency: string = "KRW", 
  displayCurrency: string = "KRW"
): Promise<string> {
  let convertedAmount = amount
  
  // USD → KRW 변환이 필요한 경우
  if (currency === "USD" && displayCurrency === "KRW") {
    convertedAmount = await exchangeRateService.convertUsdToKrw(amount)
  }
  
  const formatter = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: displayCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(convertedAmount)
}

// 기존 formatCurrency (동기식, 환율 변환 없음)
export function formatCurrency(amount: number, currency: string = "KRW"): string {
  const formatter = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}

// 환율 변환만 수행하는 함수
export async function convertToKrw(amount: number, fromCurrency: string): Promise<number> {
  if (fromCurrency === "KRW") return amount
  if (fromCurrency === "USD") {
    return await exchangeRateService.convertUsdToKrw(amount)
  }
  return amount
}

export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat("ko-KR", {
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
    day: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100
}

export function calculateChange(current: number, previous: number): {
  amount: number
  percentage: number
} {
  const amount = current - previous
  const percentage = previous !== 0 ? (amount / previous) * 100 : 0
  return { amount, percentage }
}

export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber
  return accountNumber.slice(0, 4) + '*'.repeat(accountNumber.length - 8) + accountNumber.slice(-4)
}

export function getColorByValue(value: number): string {
  if (value > 0) return 'text-success'
  if (value < 0) return 'text-destructive'
  return 'text-muted-foreground'
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

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