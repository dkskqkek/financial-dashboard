import { useMemo } from 'react'
import type { Transaction } from '@/types'
import type { TransactionFilters } from './useTransactionFilters'

export const useTransactionProcessor = (transactions: Transaction[], filters: TransactionFilters) => {
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const lowerSearchTerm = filters.searchTerm.toLowerCase()
      const matchesSearch =
        transaction.description.toLowerCase().includes(lowerSearchTerm) ||
        transaction.account.toLowerCase().includes(lowerSearchTerm) ||
        transaction.category.toLowerCase().includes(lowerSearchTerm)

      const matchesType = filters.type === 'all' || transaction.type === filters.type
      const matchesCategory = filters.category === 'all' || transaction.category === filters.category

      // TODO: Implement dateRange filter

      return matchesSearch && matchesType && matchesCategory
    })
  }, [transactions, filters])

  const summaryStats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      totalIncome: income,
      totalExpense: expense,
      netAmount: income - expense,
      incomeCount: filteredTransactions.filter(t => t.type === 'income').length,
      expenseCount: filteredTransactions.filter(t => t.type === 'expense').length,
      averageExpense: expense / Math.max(1, filteredTransactions.filter(t => t.type === 'expense').length),
    }
  }, [filteredTransactions])

  const categoryChartData = useMemo(() => {
    const expensesByCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
          return acc
        },
        {} as Record<string, number>
      )

    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }))
  }, [filteredTransactions])

  const monthlyChartData = useMemo(() => {
    const monthlyData = filteredTransactions.reduce(
      (acc, t) => {
        const month = new Date(t.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })
        if (!acc[month]) {
          acc[month] = { month, income: 0, expense: 0 }
        }
        if (t.type === 'income') {
          acc[month].income += Math.abs(t.amount)
        } else if (t.type === 'expense') {
          acc[month].expense += Math.abs(t.amount)
        }
        return acc
      },
      {} as Record<string, { month: string; income: number; expense: number }>
    )
    // sort by date before slicing
    const sortedMonths = Object.values(monthlyData).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    )
    return sortedMonths.slice(-6)
  }, [filteredTransactions])

  return {
    filteredTransactions,
    summaryStats,
    categoryChartData,
    monthlyChartData,
  }
}
