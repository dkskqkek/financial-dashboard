import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { AddCashAccountForm } from '@/components/forms/AddCashAccountForm'

// 새로 분리된 컴포넌트들
import { AssetsSummary, AccountsList, AssetsAnalytics, AssetEditModal } from './index'

// 훅과 서비스
import { useAssetCalculations } from '../hooks/useAssetCalculations'
import { AssetService, createUpdatedAccount } from '../services/assetService'

// 타입
import type { CashAccount, AssetFormData } from '../types/asset.types'

export function AssetsPage() {
  const {
    cashAccounts,
    setCashAccounts,
    deleteCashAccount,
    updateCashAccount,
    isLoading,
    setIsLoading,
    exchangeRate,
    updateExchangeRate,
    convertToKrwTotal,
  } = useAppStore()

  // 상태 관리
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedAccount, setSelectedAccount] = useState<CashAccount | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<CashAccount | null>(null)
  const [editFormData, setEditFormData] = useState<AssetFormData>({
    bankName: '',
    accountType: '',
    accountNumber: '',
    balance: '',
    memo: '',
  })

  // 커스텀 훅 사용
  const assetCalculations = useAssetCalculations({
    cashAccounts: cashAccounts || [],
    searchTerm,
    selectedType,
    convertToKrwTotal,
    exchangeRate,
  })

  // 페이지 로드 시 환율 업데이트
  useEffect(() => {
    const initializeData = async () => {
      if (!exchangeRate) {
        await updateExchangeRate()
      }
      assetCalculations.updateTotalBalance()
    }
    initializeData()
  }, [exchangeRate, updateExchangeRate])

  // 계좌 수정 모달 관리
  const handleEditAccount = (account: CashAccount) => {
    setEditingAccount(account)
    setEditFormData({
      bankName: account.bankName,
      accountType: account.accountType,
      accountNumber: account.accountNumber,
      balance: account.balance.toString(),
      memo: account.memo || '',
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingAccount) return

    const updatedAccount = createUpdatedAccount(editingAccount, editFormData)
    updateCashAccount(editingAccount.id, updatedAccount)
    setEditModalOpen(false)
    setEditingAccount(null)
  }

  const handleCancelEdit = () => {
    setEditModalOpen(false)
    setEditingAccount(null)
    setEditFormData({
      bankName: '',
      accountType: '',
      accountNumber: '',
      balance: '',
      memo: '',
    })
  }

  const handleDeleteAccount = (accountId: string) => {
    deleteCashAccount(accountId)
  }

  return (
    <div className="mobile-container space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col space-y-2 sm:space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-1">
          <h1 className="mobile-title">자산 상세</h1>
          <p className="mobile-subtitle mobile-text-wrap">현금성 자산 통합 관리</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              alert('데이터 내보내기 기능은 준비 중입니다.')
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          <AddCashAccountForm />
        </div>
      </div>

      {/* 요약 카드들 */}
      <AssetsSummary
        totalBalance={assetCalculations.totalBalance}
        usdTotalInKrw={assetCalculations.usdTotalInKrw}
        filteredAccounts={assetCalculations.filteredAccounts}
      />

      {/* 계좌 목록 */}
      <AccountsList
        filteredAccounts={assetCalculations.filteredAccounts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        setSelectedAccount={setSelectedAccount}
        onEditAccount={handleEditAccount}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* 자산 분석 */}
      <AssetsAnalytics
        cashAccounts={cashAccounts || []}
        totalBalance={assetCalculations.totalBalance}
        bankTotals={assetCalculations.bankTotals}
        typeTotals={assetCalculations.typeTotals}
      />

      {/* 계좌 수정 모달 */}
      <AssetEditModal
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        editingAccount={editingAccount}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </div>
  )
}
