import { ViewportBoundary } from '../../scripts/core/ViewportBoundary.js';
import { CoordinateSystem } from '../../scripts/core/CoordinateSystem.js';
import { jest } from '@jest/globals';

describe('ViewportBoundary 類別測試', () => {
  let canvas;
  let coordinateSystem;
  let viewport;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    coordinateSystem = new CoordinateSystem({ canvasWidth: 800, canvasHeight: 600 });
    viewport = new ViewportBoundary(canvas, coordinateSystem, {
      bufferRatio: 0.1,
      debounceTime: 250,
      tolerance: 0.5
    });
  });

  describe('checkViewportBoundaries() 方法', () => {
    test('應在緩衝區內返回 true', () => {
      // 測試中心點
      expect(viewport.checkViewportBoundaries(400, 300)).toBe(true);
      
      // 測試右側緩衝區邊緣
      const rightEdge = 800 + (800 * 0.1) - 0.5;
      expect(viewport.checkViewportBoundaries(rightEdge, 300)).toBe(true);
      
      // 測試左側緩衝區邊緣
      const leftEdge = -800 * 0.1 + 0.5;
      expect(viewport.checkViewportBoundaries(leftEdge, 300)).toBe(true);
    });

    test('應在緩衝區外返回 false', () => {
      // 測試超出右側緩衝區
      const beyondRight = 800 + (800 * 0.1) + 0.6;
      expect(viewport.checkViewportBoundaries(beyondRight, 300)).toBe(false);
      
      // 測試超出下方緩衝區
      const beyondBottom = 600 + (600 * 0.1) + 0.6;
      expect(viewport.checkViewportBoundaries(400, beyondBottom)).toBe(false);
    });
  });

  describe('視口尺寸調整', () => {
    test('應在解析度變化超過容差時更新座標系統', () => {
      jest.useFakeTimers();
      const newWidth = 1024;
      const newHeight = 768;
      
      // 模擬視窗大小改變
      canvas.width = newWidth;
      canvas.height = newHeight;
      window.dispatchEvent(new Event('resize'));
      
      // 快進防抖時間
      jest.advanceTimersByTime(250);
      
      expect(coordinateSystem.config.canvasWidth).toBe(newWidth);
      expect(coordinateSystem.config.canvasHeight).toBe(newHeight);
    });

    test('不應在變化小於容差時更新', () => {
      jest.useFakeTimers();
      const originalWidth = coordinateSystem.config.canvasWidth;
      const originalHeight = coordinateSystem.config.canvasHeight;
      
      // 模擬微小變化
      canvas.width = originalWidth + 0.4;
      canvas.height = originalHeight + 0.4;
      window.dispatchEvent(new Event('resize'));
      
      jest.advanceTimersByTime(250);
      
      expect(coordinateSystem.config.canvasWidth).toBe(originalWidth);
      expect(coordinateSystem.config.canvasHeight).toBe(originalHeight);
    });
  });

  describe('錯誤處理相容性', () => {
    test('應與 gameLogic 的日誌機制相容', () => {
      const originalLog = console.log;
      console.log = jest.fn();
      
      // 觸發錯誤情境
      viewport.checkViewportBoundaries(NaN, 300);
      
      expect(console.log).toHaveBeenCalled();
      console.log = originalLog;
    });
  });
});