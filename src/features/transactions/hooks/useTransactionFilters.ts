import { useState } from 'react'

export type TransactionTypeFilter = 'all' | 'income' | 'expense' | 'transfer'

export interface TransactionFilters {
  searchTerm: string
  type: TransactionTypeFilter
  category: string
  dateRange: string // This can be expanded later, e.g., with a date picker
}

export const useTransactionFilters = () => {
  const [filters, setFilters] = useState<TransactionFilters>({
    searchTerm: '',
    type: 'all',
    category: 'all',
    dateRange: '30days', // Default date range
  })

  const setFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return {
    filters,
    setFilter,
    setSearchTerm: (value: string) => setFilter('searchTerm', value),
    setSelectedType: (value: TransactionTypeFilter) => setFilter('type', value),
    setSelectedCategory: (value: string) => setFilter('category', value),
  }
}
