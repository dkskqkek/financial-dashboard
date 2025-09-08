import { useState, useEffect, useCallback } from 'react'
import { exchangeRateService } from '@/services/exchangeRateService'
import {
  calculateBankTotals,
  calculateTypeTotals,
  calculateUsdTotalInKrw,
  filterAccounts,
} from '../utils/assetCalculations'
import type { CashAccount, BankTotals, TypeTotals } from '../types/asset.types'

interface UseAssetCalculationsProps {
  cashAccounts: CashAccount[]
  searchTerm: string
  selectedType: string
  convertToKrwTotal: (accounts: CashAccount[]) => Promise<number>
  exchangeRate: any
}

export const useAssetCalculations = ({
  cashAccounts,
  searchTerm,
  selectedType,
  convertToKrwTotal,
  exchangeRate,
}: UseAssetCalculationsProps) => {
  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [usdTotalInKrw, setUsdTotalInKrw] = useState<number>(0)
  const [bankTotals, setBankTotals] = useState<BankTotals>({})
  const [typeTotals, setTypeTotals] = useState<TypeTotals>({})

  // 필터링된 계좌들
  const filteredAccounts = filterAccounts(cashAccounts, searchTerm, selectedType)

  const updateTotalBalance = useCallback(async () => {
    if (cashAccounts.length > 0) {
      // 총 잔액 계산
      const total = await convertToKrwTotal(filteredAccounts)
      setTotalBalance(total)

      // USD 계좌 총액 계산 (KRW 변환)
      const usdTotal = await calculateUsdTotalInKrw(filteredAccounts, exchangeRateService.convertUsdToKrw)
      setUsdTotalInKrw(usdTotal)

      // 은행별 총액 계산
      const bankTotalsMap = await calculateBankTotals(cashAccounts, convertToKrwTotal)
      setBankTotals(bankTotalsMap)

      // 계좌 유형별 총액 계산
      const typeTotalsMap = await calculateTypeTotals(cashAccounts, convertToKrwTotal)
      setTypeTotals(typeTotalsMap)
    }
  }, [cashAccounts, filteredAccounts, convertToKrwTotal])

  // 계좌 데이터가 변경될 때마다 총 잔액 재계산
  useEffect(() => {
    updateTotalBalance()
  }, [updateTotalBalance, exchangeRate])

  return {
    filteredAccounts,
    totalBalance,
    usdTotalInKrw,
    bankTotals,
    typeTotals,
    updateTotalBalance,
  }
}
