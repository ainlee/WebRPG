import { describe, test, expect } from 'vitest';
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