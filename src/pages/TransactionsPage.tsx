import React, { useMemo } from 'react'
import { useAppStore } from '@/stores'
import { useTransactionFilters } from '@/features/transactions/hooks/useTransactionFilters'
import { useTransactionProcessor } from '@/features/transactions/hooks/useTransactionProcessor'
import { TransactionHeader } from '@/features/transactions/components/TransactionHeader'
import { TransactionSummary } from '@/features/transactions/components/TransactionSummary'
import { CategoryPieChart } from '@/features/transactions/components/charts/CategoryPieChart'
import { MonthlyTrendChart } from '@/features/transactions/components/charts/MonthlyTrendChart'
import { TransactionTable } from '@/features/transactions/components/TransactionTable'

export function TransactionsPage() {
  const { transactions, isLoading, loadTransactions } = useAppStore(state => ({
    transactions: state.transactions,
    isLoading: state.isLoading,
    loadTransactions: state.loadTransactions, // Assuming loadTransactions is in the store
  }))

  const { filters, setSearchTerm, setSelectedType, setSelectedCategory } = useTransactionFilters()

  const { filteredTransactions, summaryStats, categoryChartData, monthlyChartData } = useTransactionProcessor(
    transactions,
    filters
  )

  const allCategories = useMemo(() => Array.from(new Set(transactions.map(t => t.category))), [transactions])

  return (
    <div className="mobile-container space-y-3 sm:space-y-4 lg:space-y-6">
      <TransactionHeader onRefresh={loadTransactions} isLoading={isLoading} />

      <TransactionSummary stats={summaryStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CategoryPieChart data={categoryChartData} />
        <MonthlyTrendChart data={monthlyChartData} />
      </div>

      <TransactionTable
        transactions={filteredTransactions}
        filters={filters}
        allCategories={allCategories}
        setSearchTerm={setSearchTerm}
        setSelectedType={setSelectedType}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  )
}
