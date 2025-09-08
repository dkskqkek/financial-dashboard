// 계좌 유형 옵션
export const ACCOUNT_TYPES = ['입출금통장', 'CMA', '외화예금', '정기예금', '적금'] as const

// 통화 유형
export const CURRENCY_TYPES = ['KRW', 'USD'] as const

// 계좌 필터 타입
export const FILTER_ALL = 'all' as const

export type AccountType = (typeof ACCOUNT_TYPES)[number]
export type CurrencyType = (typeof CURRENCY_TYPES)[number]
