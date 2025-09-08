import { assetsApi } from './assetsApi'
import { stocksApi } from './stocksApi'
import { marketApi } from './marketApi'
import { transactionsApi } from './transactionsApi'
import { analyticsApi } from './analyticsApi'
import { websocketService } from './websocketService'
import { mockDataGenerators } from './mockDataGenerators'

export { assetsApi } from './assetsApi'
export { stocksApi } from './stocksApi'
export { marketApi } from './marketApi'
export { transactionsApi } from './transactionsApi'
export { analyticsApi } from './analyticsApi'
export { websocketService } from './websocketService'
export { mockDataGenerators } from './mockDataGenerators'
export { httpClient } from './httpClient'
export { API_CONFIG } from './config'

export class ApiService {
  get assets() {
    return assetsApi
  }

  get stocks() {
    return stocksApi
  }

  get market() {
    return marketApi
  }

  get transactions() {
    return transactionsApi
  }

  get analytics() {
    return analyticsApi
  }

  get websocket() {
    return websocketService
  }

  get mock() {
    return mockDataGenerators
  }

  getAssetSummary = () => this.assets.getAssetSummary()
  getAssetAllocation = () => this.assets.getAssetAllocation()
  getCashAccounts = () => this.assets.getCashAccounts()
  getTransactions = (limit?: number, offset?: number) => this.transactions.getTransactions(limit, offset)
  getStocks = () => this.stocks.getStocks()
  getMarketData = () => this.market.getMarketData()
  getChartData = (timeRange: string) => this.analytics.getChartData(timeRange)
  searchStock = (symbol: string) => this.stocks.searchStock(symbol)
  searchMultipleStocks = (symbols: string[]) => this.stocks.searchMultipleStocks(symbols)
  getStockSuggestions = (query: string) => this.stocks.getStockSuggestions(query)
  connectWebSocket = (onMessage: (data: any) => void) => this.websocket.connectWebSocket(onMessage)

  getMockAssetSummary = () => this.mock.generateAssetSummary()
  getMockAssetAllocation = () => this.mock.generateAssetAllocation()
  getMockMarketData = () => this.mock.generateMarketData()
  getMockChartData = (timeRange: string) => this.mock.generateChartData(timeRange)
  getMockCashAccounts = () => this.mock.generateCashAccounts()
  getMockTransactions = () => this.mock.generateTransactions()
  getMockStocks = () => this.mock.generateStocks()
}

export const apiService = new ApiService()
