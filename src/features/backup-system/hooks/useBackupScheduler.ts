import { useEffect, useRef } from 'react'
import { useAppStore } from '@/stores'
import { BackupOrchestrator } from '../services/backupOrchestrator'
import type { BackupSchedule } from '../types'

export function useBackupScheduler(schedule: BackupSchedule) {
  const orchestrator = useRef(new BackupOrchestrator())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // 자동 백업 설정
  const setupAutoBackup = () => {
    if (!schedule.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    console.log('🔄 자동 백업 스케줄러 활성화')

    // 데이터 변경 감지 백업 (디바운스 적용)
    const handleStoreChange = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        orchestrator.current.createBackup('basic', 'auto').then(result => {
          if (result.success) {
            console.log('📝 자동 백업 완료 (데이터 변경):', result.backupId)
          }
        })
      }, 5000) // 5초 디바운스
    }

    // Zustand store 구독
    const unsubscribe = useAppStore.subscribe(handleStoreChange)

    // 정기 백업 설정
    if (schedule.type === 'interval' && schedule.intervalMinutes) {
      intervalRef.current = setInterval(() => {
        orchestrator.current.createBackup('basic', 'auto').then(result => {
          if (result.success) {
            console.log('⏰ 정기 자동 백업 완료:', result.backupId)
          }
        })
      }, schedule.intervalMinutes * 60 * 1000)
    }

    return () => {
      unsubscribe()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }

  // 일일 백업 스케줄러
  const setupDailyBackup = () => {
    if (schedule.type !== 'daily' || !schedule.dailyAt) return

    const scheduleDailyBackup = () => {
      const now = new Date()
      const [hours, minutes] = schedule.dailyAt!.split(':').map(Number)
      
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)
      
      // 이미 지난 시간이면 다음 날로 설정
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }
      
      const timeUntilBackup = scheduledTime.getTime() - now.getTime()
      
      setTimeout(() => {
        // 오늘 일일 백업이 없으면 생성
        checkAndCreateDailyBackup()
        
        // 다음 일일 백업 스케줄
        scheduleDailyBackup()
      }, timeUntilBackup)
      
      console.log(`📅 일일 백업 스케줄러 설정 - 다음 백업: ${scheduledTime.toLocaleString('ko-KR')}`)
    }

    scheduleDailyBackup()
  }

  // 오늘 일일 백업 확인 및 생성
  const checkAndCreateDailyBackup = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const dailyBackups = await orchestrator.current.getBackupList('daily')
      
      const todayBackupExists = dailyBackups.some(backup => 
        backup.timestamp.startsWith(today)
      )
      
      if (!todayBackupExists) {
        const result = await orchestrator.current.createBackup('daily', 'daily')
        if (result.success) {
          console.log('📅 일일 백업 생성 완료:', result.backupId)
        }
      } else {
        console.log(`📅 오늘(${today}) 일일 백업이 이미 존재합니다.`)
      }
    } catch (error) {
      console.error('❌ 일일 백업 확인/생성 실패:', error)
    }
  }

  // 주간 백업 스케줄러
  const setupWeeklyBackup = () => {
    if (schedule.type !== 'weekly' || schedule.weeklyOn === undefined) return

    const scheduleWeeklyBackup = () => {
      const now = new Date()
      const targetDay = schedule.weeklyOn! // 0=일요일, 1=월요일, ...
      const currentDay = now.getDay()
      
      let daysUntilTarget = targetDay - currentDay
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7 // 다음 주
      }
      
      const scheduledTime = new Date(now)
      scheduledTime.setDate(now.getDate() + daysUntilTarget)
      scheduledTime.setHours(0, 0, 0, 0) // 자정
      
      const timeUntilBackup = scheduledTime.getTime() - now.getTime()
      
      setTimeout(() => {
        orchestrator.current.createBackup('secure', 'weekly').then(result => {
          if (result.success) {
            console.log('📅 주간 백업 완료:', result.backupId)
          }
        })
        
        // 다음 주간 백업 스케줄
        scheduleWeeklyBackup()
      }, timeUntilBackup)
      
      console.log(`📅 주간 백업 스케줄러 설정 - 다음 백업: ${scheduledTime.toLocaleString('ko-KR')}`)
    }

    scheduleWeeklyBackup()
  }

  // 월간 백업 스케줄러
  const setupMonthlyBackup = () => {
    if (schedule.type !== 'monthly' || !schedule.monthlyOn) return

    const scheduleMonthlyBackup = () => {
      const now = new Date()
      const targetDate = schedule.monthlyOn! // 1-31
      
      let scheduledTime = new Date(now.getFullYear(), now.getMonth(), targetDate, 0, 0, 0, 0)
      
      // 이미 지난 날짜면 다음 달로 설정
      if (scheduledTime <= now) {
        scheduledTime = new Date(now.getFullYear(), now.getMonth() + 1, targetDate, 0, 0, 0, 0)
      }
      
      const timeUntilBackup = scheduledTime.getTime() - now.getTime()
      
      setTimeout(() => {
        orchestrator.current.createBackup('secure', 'monthly').then(result => {
          if (result.success) {
            console.log('📅 월간 백업 완료:', result.backupId)
          }
        })
        
        // 다음 월간 백업 스케줄
        scheduleMonthlyBackup()
      }, timeUntilBackup)
      
      console.log(`📅 월간 백업 스케줄러 설정 - 다음 백업: ${scheduledTime.toLocaleString('ko-KR')}`)
    }

    scheduleMonthlyBackup()
  }

  // 스케줄러 초기화
  useEffect(() => {
    const cleanup = setupAutoBackup()
    
    // 일일/주간/월간 백업 스케줄러 설정
    setupDailyBackup()
    setupWeeklyBackup()
    setupMonthlyBackup()
    
    // 시작 시 일일 백업 확인
    if (schedule.enabled) {
      checkAndCreateDailyBackup()
    }

    return () => {
      if (cleanup) cleanup()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [schedule])

  return {
    checkAndCreateDailyBackup,
  }
}