import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/', // 👉 명시적 루트 경로 설정
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            devOptions: {
                enabled: false // 👉 개발 환경에서는 PWA 엔진 비활성화 (캐싱 방지)
            }
        })
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        origin: 'https://lean-blotchiest-postvocalically.ngrok-free.dev', // 👉 에셋 경로를 ngrok 주소로 고정
        hmr: {
            host: 'lean-blotchiest-postvocalically.ngrok-free.dev',
            clientPort: 443,
            protocol: 'wss'
        },
        watch: {
            usePolling: true,
        },
        proxy: {
            '/api': {
                target: 'http://web:8000',
                changeOrigin: true,
                secure: false,
            },
            '/media': {
                target: 'http://web:8000',
                changeOrigin: true,
                secure: false,
            },
            '/static': {
                target: 'http://web:8000',
                changeOrigin: true,
                secure: false,
            },
            '/accounts': {
                target: 'http://web:8000',
                changeOrigin: true,
                secure: false,
            },
        }
    }
})