// 차트 색상 팔레트
export const STOCK_COLORS = ['#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

// 섹터 옵션
export const SECTOR_OPTIONS = [
  '기술',
  '반도체',
  '자동차',
  '금융',
  '바이오',
  '에너지',
  '소비재',
  '패시브',
  '채권',
  '리츠',
  '원자재',
  '헬스케어',
  '통신',
  '유틸리티',
  '가상화폐',
] as const

// 수익률 범위
export const RETURN_RANGES = ['20% 이상', '10-20%', '0-10%', '0% 미만'] as const

// 디바운싱 시간
export const DEBOUNCE_DELAY = {
  CALCULATION: 200,
  TOTAL_UPDATE: 300,
} as const

export type SectorOption = (typeof SECTOR_OPTIONS)[number]
export type ReturnRange = (typeof RETURN_RANGES)[number]
