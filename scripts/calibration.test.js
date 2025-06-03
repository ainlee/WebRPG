import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { normalizePosition } from './gameLogic.js';
import { MOVEMENT_TOLERANCE } from './constants.js';

describe('位置校準模組', () => {
  const mockPlayer = {
    position: { x: 0, y: 0 },
    gridSize: 32
  };

  test('應正確正規化32網格座標', () => {
    const input = { x: 35.5, y: -2.3 };
    const expected = { x: 32, y: 0 };
    const result = normalizePosition(mockPlayer, input);
    expect(Math.abs(result.x - expected.x)).toBeLessThanOrEqual(MOVEMENT_TOLERANCE);
    expect(Math.abs(result.y - expected.y)).toBeLessThanOrEqual(MOVEMENT_TOLERANCE);
  });

  test('應處理64網格邊界值', () => {
    mockPlayer.gridSize = 64;
    const input = { x: 63.9, y: -0.1 };
    const expected = { x: 64, y: 0 };
    const result = normalizePosition(mockPlayer, input);
    expect(Math.abs(result.x - expected.x)).toBeLessThanOrEqual(mockPlayer.gridSize * 0.1 * 2);
  });

  test('應拋出錯誤當網格尺寸不合法', () => {
    mockPlayer.gridSize = 0;
    expect(() => normalizePosition(mockPlayer, { x: 10, y: 10 }))
      .toThrow('無效網格尺寸');
  });
});
import { drawPath } from './input.js';

// 初始化JSDOM環境
const dom = new JSDOM(`<!DOCTYPE html><html><body>
  <div id="log"></div>
</body></html>`);
globalThis.window = dom.window;
globalThis.document = dom.window.document;
// 模擬動畫幀方法
globalThis.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
  return 1;
};

afterEach(() => {
  vi.clearAllMocks();
  window._navDots = [];
});

describe('導航路徑繪製', () => {
  let mockScene;
  const testPath = [
    {x: 100, y: 100},
    {x: 120, y: 120},
    {x: 140, y: 140}
  ];

  beforeEach(() => {
    mockScene = {
      add: {
        circle: vi.fn().mockImplementation((x, y, radius, color, alpha) => ({
          x, y, radius, color, alpha,
          setDepth: vi.fn(),
          setAlpha: vi.fn(),
          destroy: vi.fn()
        }))
      }
    };
    window._navDots = [];
  });

  test('應正確建立路徑點物件', () => {
    const dots = drawPath(mockScene, testPath);
    expect(dots).toStrictEqual(expect.any(Array));
    expect(mockScene.add.circle).toHaveBeenCalledTimes(3);
    dots.forEach((dot, index) => {
      expect(dot.x).toBe(testPath[index].x);
      expect(dot.y).toBe(testPath[index].y);
      expect(dot.radius).toBe(16); // tileSize 假設為 96 (96/6=16)
      expect(dot.color).toBe(0xFFFF00);
      expect(dot.alpha).toBe(0.8);
    });
  });

  test('應清除舊路徑點', () => {
    window._navDots = [{ destroy: vi.fn() }];
    drawPath(mockScene, testPath);
    expect(window._navDots[0].destroy).toHaveBeenCalled();
  });

  test('空路徑應正常處理', () => {
    const dots = drawPath(mockScene, []);
    expect(dots).toStrictEqual([]);
  });

  test('無效場景物件應拋出錯誤', () => {
    expect(() => drawPath(null, testPath)).toThrow(TypeError);
    expect(() => drawPath({}, testPath)).toThrow(TypeError);
  });
});