import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // phaser路徑已通過importmap處理
    }
  },
  server: {
    port: 5500
  }
})
