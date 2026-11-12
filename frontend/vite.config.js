import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Gas Management System',
        short_name: 'GasDriver',
        description: 'ระบบจัดการออเดอร์และจัดส่งแก๊ส',
        theme_color: '#1A1A1A',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/gas-price-128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/gas-price-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    watch: {
      usePolling: true, // บังคับให้ Vite ตรวจจับการเปลี่ยนแปลงของไฟล์ในระบบ Windows
    },
  },
})