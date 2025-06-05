import { defineConfig } from 'vite'

export default defineConfig({
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
  }
})