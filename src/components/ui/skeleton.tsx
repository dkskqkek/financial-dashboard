import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  // Additional props can be added here
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn('skeleton', className)} {...props} />
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <div className={cn('skeleton-text', className)} {...props} />
}

export function SkeletonAvatar({ className, ...props }: SkeletonProps) {
  return <div className={cn('skeleton-avatar', className)} {...props} />
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('mobile-card', className)} {...props}>
      <div className="mobile-card-header">
        <SkeletonText className="h-5 w-1/3" />
        <SkeletonText className="h-4 w-1/2 mt-2" />
      </div>
      <div className="space-y-3">
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-4 w-2/3" />
        <SkeletonText className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonMetricCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('mobile-card mobile-stat-card', className)} {...props}>
      <SkeletonAvatar className="mx-auto mb-3" />
      <SkeletonText className="h-6 w-20 mx-auto mb-2" />
      <SkeletonText className="h-4 w-16 mx-auto" />
    </div>
  )
}
