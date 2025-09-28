import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Let cookies flow through the proxy
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie']
            if (setCookie) {
              proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
                cookie.replace(/;\s*SameSite=None/i, '')
              )
            }
          })
        }
      }
    }
  }
})
