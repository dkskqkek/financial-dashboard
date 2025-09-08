import React from 'react'

interface TransactionTypeSelectorProps {
  value: 'buy' | 'sell' | 'existing'
  onChange: (type: 'buy' | 'sell' | 'existing') => void
}

export function TransactionTypeSelector({ value, onChange }: TransactionTypeSelectorProps) {
  return (
    <div>
      <label htmlFor="tradeType" className="text-sm font-medium">
        매매 구분
      </label>
      <select
        id="tradeType"
        name="tradeType"
        value={value}
        onChange={e => onChange(e.target.value as 'buy' | 'sell' | 'existing')}
        className="w-full mt-1 px-3 py-2 border rounded-md"
        required
      >
        <option value="buy">매수</option>
        <option value="sell">매도</option>
        <option value="existing">기존 보유</option>
      </select>
    </div>
  )
}
