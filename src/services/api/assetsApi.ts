import { httpClient } from './httpClient'
import { mockDataGenerators } from './mockDataGenerators'
import type { AssetSummary, AssetAllocation, CashAccount } from '@/types'

export class AssetsApi {
  async getAssetSummary(): Promise<AssetSummary> {
    try {
      return await httpClient.request<AssetSummary>('/assets/summary')
    } catch (error) {
      console.warn('Using mock data for asset summary')
      return mockDataGenerators.generateAssetSummary()
    }
  }

  async getAssetAllocation(): Promise<AssetAllocation> {
    try {
      return await httpClient.request<AssetAllocation>('/assets/allocation')
    } catch (error) {
      console.warn('Using mock data for asset allocation')
      return mockDataGenerators.generateAssetAllocation()
    }
  }

  async getCashAccounts(): Promise<CashAccount[]> {
    try {
      return await httpClient.request<CashAccount[]>('/cash/accounts')
    } catch (error) {
      console.warn('Cash accounts API not available, returning empty array')
      return []
    }
  }

  getMockAssetSummary(): AssetSummary {
    return mockDataGenerators.generateAssetSummary()
  }

  getMockAssetAllocation(): AssetAllocation {
    return mockDataGenerators.generateAssetAllocation()
  }

  getMockCashAccounts(): CashAccount[] {
    return mockDataGenerators.generateCashAccounts()
  }
}

export const assetsApi = new AssetsApi()
