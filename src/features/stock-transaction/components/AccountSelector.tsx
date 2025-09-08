import React from 'react'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/stores'

interface AccountSelectorProps {
  selectedAccount: string
  customAccount: string
  onAccountChange: (account: string) => void
  onCustomAccountChange: (account: string) => void
}

export function AccountSelector({
  selectedAccount,
  customAccount,
  onAccountChange,
  onCustomAccountChange,
}: AccountSelectorProps) {
  const { cashAccounts } = useAppStore()

  return (
    <div>
      <label htmlFor="stockAccount" className="text-sm font-medium">
        거래 계좌
      </label>
      <select
        id="stockAccount"
        name="stockAccount"
        value={selectedAccount}
        onChange={e => onAccountChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 border rounded-md"
        required
      >
        <option value="">계좌를 선택하세요</option>
        {cashAccounts.map(account => (
          <option key={account.id} value={account.bankName + ' - ' + account.accountType}>
            {account.bankName} - {account.accountType} ({account.currency} {account.balance.toLocaleString()})
          </option>
        ))}
        <option value="기타">기타 (직접 입력)</option>
      </select>
      {selectedAccount === '기타' && (
        <Input
          className="mt-2"
          value={customAccount}
          placeholder="계좌명을 직접 입력하세요"
          onChange={e => onCustomAccountChange(e.target.value)}
          required
        />
      )}
    </div>
  )
}
