import React, { ReactNode } from 'react'
import { UI_STYLES } from '@/constants/ui'

export interface PageLayoutProps {
  title: string
  description?: string
  headerAction?: ReactNode
  children: ReactNode
  className?: string
  containerType?: 'mobile' | 'desktop'
}

export function PageLayout({
  title,
  description,
  headerAction,
  children,
  className = '',
  containerType = 'mobile'
}: PageLayoutProps) {
  const containerClass = containerType === 'mobile' 
    ? `mobile-container ${UI_STYLES.SECTION_SPACING}`
    : 'space-y-6 p-6'

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className={
            containerType === 'mobile' 
              ? 'mobile-title' 
              : 'text-3xl font-bold'
          }>
            {title}
          </h1>
          {description && (
            <p className={
              containerType === 'mobile'
                ? 'mobile-subtitle mobile-text-wrap'
                : 'text-muted-foreground'
            }>
              {description}
            </p>
          )}
        </div>
        {headerAction}
      </div>

      {/* Page Content */}
      {children}
    </div>
  )
}

// 통계 카드를 위한 공통 그리드 컨테이너
export interface StatsGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function StatsGrid({ 
  children, 
  columns = 4, 
  className = '' 
}: StatsGridProps) {
  const gridClass = {
    2: UI_STYLES.GRID_2,
    3: UI_STYLES.GRID_3, 
    4: UI_STYLES.GRID_4
  }[columns]

  return (
    <div className={`grid ${gridClass} gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  )
}

// 콘텐츠 섹션을 위한 래퍼
export interface ContentSectionProps {
  children: ReactNode
  className?: string
}

export function ContentSection({ children, className = '' }: ContentSectionProps) {
  return (
    <div className={`${UI_STYLES.CARD_SPACING} ${className}`}>
      {children}
    </div>
  )
}