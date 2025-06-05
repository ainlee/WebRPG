# WebRPG 專案交接任務清單

## 緊急處理項目 (48小時內)
- [ ] 新增字體授權聲明頁面
- [x] 標記16_Pixel素材為待驗證狀態
   完成時間：2025/6/3 16:52
   修改內容：
   - 在images/16_Pixel-Assets_Pack-Demo/Hello.txt加入驗證狀態標記
   相關文件：
   - images/16_Pixel-Assets_Pack-Demo/Hello.txt
   - spec.md 第12節「第三方資源管理規範」
- [x] 建立基礎單元測試框架
   完成時間：2025/6/3 16:59
   修改內容：
   - 新增 calibration.test.js 測試檔案
   - 實作位置校準模組單元測試
   相關文件：
   - scripts/calibration.test.js
   - scripts/constants.js 第45行容錯率設定

## 高優先級技術債
- [x] 修正 npm run preview 指令缺失問題 ※影響度：★★★☆
   完成時間：2025/6/5
   修改內容：
   - 在 package.json 添加 preview 指令
   - 安裝 serve@14.2.1 套件
   相關文件：
   - package.json 第12行
   - webpack.config.js
- [ ] 實作戰鬥系統基礎框架（combat.js） ※影響度：★★★★☆
- [ ] 完成存檔系統加密功能（save.js） ※工程規模：▲▲▲△△
- ~~[ ] 開發任務日誌UI組件~~ 改為使用Phaser內建組件
- [ ] 實作ECS架構核心模組 ※技術缺口

## 圖形系統優化
- [x] 實作Canvas粒子系統 ※影響度：★★★☆
   完成時間：2025/6/5
   修改內容：
   - 新增ParticleSystem核心類別
   - 整合至ECS架構
   相關文件：
   - scripts/graphics.js 第45-89行
   - spec.md 第3.5節「粒子系統規範」

## 自動導航模組任務進度
- [x] 新增A*算法v2.1技術規範
- [x] 定義移動速度參數範圍(2.5m/s ±20%)
- [x] 設定碰撞容錯機制(0.3單位半徑)
- [ ] ~~實作動態障礙物處理~~ → 移至v1.2.0
- [x] 更新模組依賴關係圖

## 架構強化項目
- [ ] 補充Phaser框架決策記錄（ADR-001）
- [x] 生成模組依賴關係圖
- [x] 補齊spec.md缺失的3種UML圖表
- [ ] 整合自動導航模組至ECS架構
- ~~[ ] 實作動態障礙物處理~~ → 移轉至v1.2.0

## 資源驗證任務
- [ ] 確認Cubic字體授權合規性 ※進行中
- [ ] 聯繫16_Pixel素材作者取得書面授權
- [ ] 建立素材授權追蹤清單

## 代碼品質提升
- [ ] 提升註解覆蓋率至70%以上
- [ ] 實作程式碼風格檢查工具
- [ ] 重構新舊動畫系統並存問題
## 已完成項目
- [x] 修正 index.html 第17行內聯樣式問題
  完成時間：2025/6/3 15:25
  修改內容：
  - 移除 \<div id="dev-tools"\> 的 style 屬性
  - 新增 ARIA 角色屬性(role="region", aria-label="開發者工具面板")
  - 同步更新 styles.css 的 z-index 定義
  相關文件：
  - index.html 第17行
  - styles.css 第41行
  - spec.md 第45節「可訪問性規範」