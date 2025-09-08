import { httpClient } from './httpClient'
import { mockDataGenerators } from './mockDataGenerators'
import type { Transaction } from '@/types'

export class TransactionsApi {
  async getTransactions(limit?: number, offset?: number): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams()
      if (limit) {
        params.append('limit', limit.toString())
      }
      if (offset) {
        params.append('offset', offset.toString())
      }

      return await httpClient.request<Transaction[]>(`/transactions?${params.toString()}`)
    } catch (error) {
      console.warn('Transactions API not available, returning empty array')
      return []
    }
  }

  getMockTransactions(): Transaction[] {
    return mockDataGenerators.generateTransactions()
  }
}

export const transactionsApi = new TransactionsApi()
