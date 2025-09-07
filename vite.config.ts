import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkOnly' // 캐시 비활성화
          },
          {
            urlPattern: /^http:\/\/localhost:3007\/api\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\.(?:js|css|html)$/,
            handler: 'NetworkFirst', // 정적 자원도 네트워크 우선
            options: {
              cacheName: 'static-cache',
              networkTimeoutSeconds: 5
            }
          }
        ],
        navigateFallback: null,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true // 오래된 캐시 자동 정리
      },
      manifest: {
        name: 'Financial Dashboard',
        short_name: 'FinDash',
        description: '개인 금융 자산 관리 대시보드',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // 네트워크에서 접근 가능하도록 설정
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          recharts: ['recharts'],
          ui: ['lucide-react']
        },
        // 캐시 버스팅을 위한 파일명에 해시 추가
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
  },
})