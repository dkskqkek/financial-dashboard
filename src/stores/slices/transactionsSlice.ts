import { StateCreator } from 'zustand'
import { apiService } from '@/services/api'
import type { Transaction, CashAccount } from '@/types'

export interface TransactionsSlice {
  // Transactions
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  loadTransactions: () => Promise<void>

  // Loading state for transactions
  isTransactionsLoading: boolean
  setTransactionsLoading: (loading: boolean) => void
}

export const createTransactionsSlice: StateCreator<
  TransactionsSlice & { cashAccounts: CashAccount[]; isLoading: boolean; setIsLoading: (loading: boolean) => void },
  [],
  [],
  TransactionsSlice
> = (set, get) => ({
  // Transactions
  transactions: [],
  setTransactions: transactions => set({ transactions }),
  loadTransactions: async () => {
    set({ isLoading: true })
    try {
      const transactionData = await apiService.getTransactions()
      set({ transactions: transactionData, isLoading: false })
    } catch (error) {
      console.error('Failed to load transactions:', error)
      set({ isLoading: false })
    }
  },
  addTransaction: transaction =>
    set(state => {
      // 계좌 잔액 자동 업데이트
      const updatedCashAccounts = state.cashAccounts.map(account => {
        if (
          account.bankName + ' - ' + account.accountType === transaction.account ||
          account.bankName === transaction.account
        ) {
          return {
            ...account,
            balance: account.balance + transaction.amount,
            lastTransactionDate: transaction.date,
          }
        }
        return account
      })

      return {
        transactions: [...state.transactions, transaction],
        cashAccounts: updatedCashAccounts,
      }
    }),
  updateTransaction: (id, updates) =>
    set(state => ({
      transactions: state.transactions.map(transaction =>
        transaction.id === id ? { ...transaction, ...updates } : transaction
      ),
    })),
  deleteTransaction: id =>
    set(state => ({
      transactions: state.transactions.filter(transaction => transaction.id !== id),
    })),

  // Loading state for transactions
  isTransactionsLoading: false,
  setTransactionsLoading: (loading: boolean) => set({ isTransactionsLoading: loading }),
})
