import type { CashAccount, AssetCalculations, BankTotals, TypeTotals } from '../types/asset.types'

/**
 * 계좌 필터링 함수
 */
export const filterAccounts = (accounts: CashAccount[], searchTerm: string, selectedType: string): CashAccount[] => {
  return accounts.filter(account => {
    const matchesSearch =
      account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.includes(searchTerm)

    const matchesType = selectedType === 'all' || account.accountType === selectedType

    return matchesSearch && matchesType
  })
}

/**
 * 은행별 총액 계산
 */
export const calculateBankTotals = async (
  accounts: CashAccount[],
  convertToKrwTotal: (accounts: CashAccount[]) => Promise<number>
): Promise<BankTotals> => {
  const banks = Array.from(new Set(accounts.map(acc => acc.bankName)))
  const bankTotalsMap: BankTotals = {}

  for (const bankName of banks) {
    const bankAccounts = accounts.filter(acc => acc.bankName === bankName)
    bankTotalsMap[bankName] = await convertToKrwTotal(bankAccounts)
  }

  return bankTotalsMap
}

/**
 * 계좌 유형별 총액 계산
 */
export const calculateTypeTotals = async (
  accounts: CashAccount[],
  convertToKrwTotal: (accounts: CashAccount[]) => Promise<number>
): Promise<TypeTotals> => {
  const types = Array.from(new Set(accounts.map(acc => acc.accountType)))
  const typeTotalsMap: TypeTotals = {}

  for (const accountType of types) {
    const typeAccounts = accounts.filter(acc => acc.accountType === accountType)
    typeTotalsMap[accountType] = await convertToKrwTotal(typeAccounts)
  }

  return typeTotalsMap
}

/**
 * USD 계좌 총액을 KRW로 변환
 */
export const calculateUsdTotalInKrw = async (
  accounts: CashAccount[],
  convertUsdToKrw: (amount: number) => Promise<number>
): Promise<number> => {
  const usdAccounts = accounts.filter(acc => acc.currency === 'USD')
  let usdTotal = 0

  for (const account of usdAccounts) {
    usdTotal += await convertUsdToKrw(account.balance)
  }

  return usdTotal
}

/**
 * 비중 계산
 */
export const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? (value / total) * 100 : 0
}
