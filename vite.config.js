import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      phaser: '/node_modules/phaser/dist/phaser.min.js'
    }
  },
  esbuild: {
    jsxInject: `import React from 'react'`, // 防止 JSX 解析錯誤
    loader: 'jsx',
    include: /\.jsx?$/,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: './index.html'
    }
  },
  test: {
    browser: {
      enabled: true,
      name: 'chrome',
      headless: true
    },
    environment: 'jsdom',
    setupFiles: './test-setup.js',
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
})