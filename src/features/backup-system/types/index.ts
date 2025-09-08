export interface BackupData {
  id: string
  timestamp: string
  version: string
  data: any
  hash: string
  locked?: boolean
  reason?: 'manual' | 'auto' | 'daily' | 'weekly' | 'monthly' | 'emergency'
  size?: number
  compressed?: boolean
}

export interface BackupStrategy {
  name: string
  description: string
  maxBackups?: number
  retentionDays?: number
  autoBackup?: boolean
  compression?: boolean
  encryption?: boolean
}

export interface BackupStorageProvider {
  name: string
  save(key: string, data: BackupData): Promise<boolean>
  load(key: string): Promise<BackupData | null>
  delete(key: string): Promise<boolean>
  list(): Promise<string[]>
  clear(): Promise<boolean>
  getSize(): Promise<number>
}

export interface BackupValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  dataIntegrityCheck: boolean
  hashMatch: boolean
}

export interface BackupSchedule {
  type: 'interval' | 'daily' | 'weekly' | 'monthly'
  intervalMinutes?: number
  dailyAt?: string // HH:MM format
  weeklyOn?: number // 0-6 (Sunday-Saturday)
  monthlyOn?: number // 1-31 (day of month)
  enabled: boolean
}

export interface BackupManagerState {
  backups: BackupData[]
  dailyBackups: BackupData[]
  isLoading: boolean
  activeTab: 'auto' | 'daily' | 'secure' | 'archive'
  lastBackupTime: string | null
  autoBackupEnabled: boolean
  schedule: BackupSchedule
}

export interface BackupOperationResult {
  success: boolean
  message?: string
  backupId?: string
  errors?: string[]
}

export interface BackupExportOptions {
  format: 'json' | 'compressed'
  includeMetadata: boolean
  filename?: string
}

export interface BackupImportResult {
  success: boolean
  backupData?: BackupData
  errors?: string[]
  warnings?: string[]
}