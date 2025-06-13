# WebRPG

## 專案描述
基於Phaser.js框架開發的2.5D角色扮演遊戲，採用等角投影技術實現立體空間效果，整合物理引擎與深度緩衝管理系統，提供流暢的遊戲體驗。

## 安裝及執行方式

### 前置需求
- Node.js 16+
- npm 8+

### 安裝步驟
1. 克隆儲存庫
```powershell
git clone https://github.com/your-repo/WebRPG.git
```
2. 安裝依賴
```powershell
npm install
```

### 執行指令
| 指令           | 說明                     |
|----------------|--------------------------|
| `npm run dev`  | 啟動開發伺服器           |
| `npm run build`| 建置生產環境版本         |
| `npm test`     | 執行單元測試             |

### 部署指引
1. 建置生產版本
```powershell
npm run build
```
2. 部署dist目錄至靜態主機
3. 設定Nginx/Apache指向dist目錄
4. 啟用Gzip壓縮與Brotli壓縮
5. 設定Cache-Control標頭最佳化靜態資源快取

## 系統架構
![架構圖](./docs/architecture.png)

## 授權資訊
MIT License © 2025 Your Name