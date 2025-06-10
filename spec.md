# WebRPG 專案規格書

## 系統架構
1. **核心模組**
   - WorldModule: 管理視覺模式與場景圖層
   - ViewMode: 2D/2.5D 模式切換
   - SceneLayers: 分層管理場景物件

2. **技術規格**
   - 前端框架: Phaser 3 + Vite
   - 渲染引擎: WebGL 2.0
   - 模組系統: ES6 Classes
   - 測試框架: Jest + jest-canvas-mock

## 視覺模式功能
```javascript
// 視覺模式參數設定
{
  projectionMatrix: Phaser.Math.Matrix4,
  cameraZoom: Number,
  depthTest: Boolean,
  layerScale: Number,
  shadowIntensity: Number
}
```

## 場景圖層架構
| 層級名稱 | 內容 | 渲染優先級 |
|----------|------|------------|
| background | 背景元素 | 1 |
| terrain | 地形地貌 | 2 |
| objects | 可互動物件 | 3 |
| characters | 角色與NPC | 4 |
| effects | 視覺特效 | 5 |

## API 端點
- `/api/map-generate` (POST)
  - 參數: { seed: String, difficulty: Number }
  - 回傳: { ground: Array, objectLayer: Array }

## 更新記錄
- 2025/6/10
  - 重構WorldModule為ES6 Class
  - 統一WebGL狀態管理
  - 新增場景圖層初始化邏輯