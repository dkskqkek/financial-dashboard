import { apiService } from '@/services/api'
import type { CashAccount, AssetFormData } from '../types/asset.types'

export class AssetService {
  static async loadCashAccounts(
    setIsLoading: (loading: boolean) => void,
    setCashAccounts: (accounts: CashAccount[]) => void
  ): Promise<void> {
    setIsLoading(true)
    try {
      const accounts = await apiService.getCashAccounts()
      setCashAccounts(accounts)
    } catch (error) {
      console.error('Failed to load cash accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }
}

/**
 * 계좌 수정 관련 유틸리티 함수
 */
export const createUpdatedAccount = (editingAccount: CashAccount, formData: AssetFormData): CashAccount => {
  return {
    ...editingAccount,
    bankName: formData.bankName,
    accountType: formData.accountType,
    accountNumber: formData.accountNumber,
    balance: Number(formData.balance),
    memo: formData.memo,
  }
}
