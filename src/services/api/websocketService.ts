import { API_CONFIG } from './config'

export class WebSocketService {
  connectWebSocket(onMessage: (data: any) => void): WebSocket {
    const ws = new WebSocket(API_CONFIG.wsUrl)

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('WebSocket message parsing error:', error)
      }
    }

    ws.onerror = error => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    return ws
  }
}

export const websocketService = new WebSocketService()
