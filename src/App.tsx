import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { AssetsPage } from '@/pages/AssetsPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { StocksPage } from '@/pages/StocksPage'
import { SavingsPage } from '@/pages/SavingsPage'
import { RealEstatePage } from '@/pages/RealEstatePage'
import { MonthlyPage } from '@/pages/MonthlyPage'
import { SettingsPage } from '@/pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="stocks" element={<StocksPage />} />
            <Route path="savings" element={<SavingsPage />} />
            <Route path="real-estate" element={<RealEstatePage />} />
            <Route path="monthly" element={<MonthlyPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App