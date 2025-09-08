import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { AssetsPage } from '@/pages/AssetsPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { StocksPage } from '@/pages/StocksPage'
import { AccountsPage } from '@/pages/AccountsPage'
import { SavingsPage } from '@/pages/SavingsPage'
import { RealEstatePage } from '@/pages/RealEstatePage'
import { MonthlyPage } from '@/pages/MonthlyPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { setupAutoBackup, setupDailyBackupScheduler } from '@/utils/dataBackup'
import { setupIndestructibleBackup } from '@/utils/indestructibleBackup'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  useEffect(() => {
    // 🛡️ 불멸 백업 시스템 최우선 활성화
    setupIndestructibleBackup()

    // 기존 백업 시스템도 유지 (추가 보안)
    setupAutoBackup()
    setupDailyBackupScheduler()

    console.log('🔒 모든 백업 시스템 활성화 완료')
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="stocks" element={<StocksPage />} />
            <Route path="accounts" element={<AccountsPage />} />
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
