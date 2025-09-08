// Main component export
export { BackupManager } from './components/BackupManager'

// Sub-components
export { BackupList } from './components/BackupList'
export { BackupActions } from './components/BackupActions'
export { BackupStatus } from './components/BackupStatus'

// Services
export { BackupOrchestrator } from './services/backupOrchestrator'
export { LocalStorageProvider } from './services/localStorageProvider'
export { IndexedDBProvider } from './services/indexedDBProvider'

// Hooks
export { useBackupManager } from './hooks/useBackupManager'
export { useBackupScheduler } from './hooks/useBackupScheduler'

// Utils
export { HashUtils } from './utils/hashUtils'
export { CompressionUtils } from './utils/compressionUtils'

// Types
export type {
  BackupData,
  BackupStrategy,
  BackupStorageProvider,
  BackupValidationResult,
  BackupSchedule,
  BackupManagerState,
  BackupOperationResult,
  BackupExportOptions,
  BackupImportResult,
} from './types'