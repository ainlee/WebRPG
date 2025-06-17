import { defineConfig, mergeConfig, loadEnv } from 'vite'
import path from 'path'

// 通用基礎配置
const baseConfig = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'scripts'),
      'phaser': path.resolve(__dirname, 'node_modules/phaser/dist/phaser.js')
    }
  }
}

// 客戶端配置
const clientConfig = {
  server: {
    port: 5500,
    strictPort: true
  },
  optimizeDeps: {
    include: process.env.SSR ? [] : ['phaser'],
    exclude: ['@/server/*']
  },
  build: {
    target: 'ESNext',
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    sourcemap: true,
    rollupOptions: {
      external: ['phaser'],
      output: {
        globals: {
          'phaser': 'Phaser'
        }
      }
    }
  }
}

// 伺服器端配置 (SSR)
const serverConfig = {
  ssr: {
    target: 'node',
    noExternal: true,
    external: ['phaser']
  },
  build: {
    ssr: true,
    outDir: 'dist/server',
    rollupOptions: {
      input: './scripts/server/entry-server.js'
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // 分離客戶端伺服器配置
  if (env.SSR === 'true') {
    return mergeConfig(baseConfig, serverConfig)
  }

  // 客戶端專用配置
  return mergeConfig(baseConfig, {
    ...clientConfig,
    define: {
      global: 'window',      // 解決 global 未定義問題
      __SSR__: JSON.stringify(false),
      __PHASER_PATH__: JSON.stringify(
        env.NODE_ENV === 'test'
          ? './node_modules/phaser/dist/phaser.js'
          : 'phaser/dist/phaser.esm.js'
      )
    },
    test: {
      environment: 'jsdom',  // 測試環境模擬瀏覽器
      setupFiles: './test-setup.js'
    }
  })
})
