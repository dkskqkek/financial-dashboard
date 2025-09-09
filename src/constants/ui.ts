// UI 텍스트 상수
export const UI_TEXT = {
  // 버튼 텍스트
  SAVE: '저장',
  CANCEL: '취소',
  CONFIRM: '확인',
  DELETE: '삭제',
  EDIT: '수정',
  ADD: '추가',
  
  // 로딩 텍스트
  SAVING: '저장 중...',
  LOADING: '로딩 중...',
  UPLOADING: '업로드 중...',
  PROCESSING: '처리 중...',
  
  // 상태 텍스트
  SUCCESS: '성공',
  ERROR: '오류',
  WARNING: '경고',
  INFO: '정보',
  
  // 폼 관련
  REQUIRED: '필수',
  OPTIONAL: '선택',
  SELECT_PLACEHOLDER: '선택하세요',
  
  // 데이터 관련
  NO_DATA: '데이터가 없습니다',
  EMPTY_LIST: '목록이 비어있습니다',
  
} as const

// UI 스타일 상수
export const UI_STYLES = {
  // 모달 크기
  MODAL_SM: 'sm:max-w-[425px]',
  MODAL_MD: 'sm:max-w-[500px]',
  MODAL_LG: 'sm:max-w-[600px]',
  MODAL_XL: 'sm:max-w-[800px]',
  
  // 간격
  FORM_SPACING: 'space-y-4',
  CARD_SPACING: 'space-y-6',
  SECTION_SPACING: 'space-y-3 sm:space-y-4 lg:space-y-6',
  
  // 그리드
  GRID_2: 'grid-cols-1 md:grid-cols-2',
  GRID_3: 'grid-cols-1 md:grid-cols-3',
  GRID_4: 'grid-cols-1 md:grid-cols-4',
  
  // 버튼 그룹
  BUTTON_GROUP: 'flex space-x-2',
  BUTTON_GROUP_END: 'flex justify-end space-x-2 pt-4',
  
} as const

// 애니메이션 상수
export const UI_ANIMATIONS = {
  SPIN: 'animate-spin',
  PULSE: 'animate-pulse',
  BOUNCE: 'animate-bounce',
  
  // 트랜지션
  TRANSITION_ALL: 'transition-all duration-200',
  TRANSITION_COLORS: 'transition-colors duration-200',
  
} as const

// 컬러 상수 (CSS 클래스)
export const UI_COLORS = {
  // 텍스트 컬러
  SUCCESS: 'text-success',
  ERROR: 'text-destructive', 
  WARNING: 'text-warning',
  MUTED: 'text-muted-foreground',
  
  // 배경 컬러
  SUCCESS_BG: 'bg-success/10',
  ERROR_BG: 'bg-destructive/10',
  WARNING_BG: 'bg-warning/10',
  PRIMARY_BG: 'bg-primary/10',
  
} as const

// 아이콘 크기 상수
export const UI_ICON_SIZES = {
  XS: 'h-3 w-3',
  SM: 'h-4 w-4', 
  MD: 'h-5 w-5',
  LG: 'h-6 w-6',
  XL: 'h-8 w-8',
} as const