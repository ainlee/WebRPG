import { describe, test, expect } from 'vitest';
import { normalizePosition } from './gameLogic.js';
import { initIsometric, isoTransform } from './world.js';

describe('位置校準模組', () => {
  const mockPlayer = {
    position: { x: 0, y: 0 },
    gridSize: 32
  };

  test('應正確正規化32網格座標', () => {
    const input = { x: 35.5, y: -2.3 };
    const expected = { x: 32, y: 0 };
    const result = normalizePosition(mockPlayer, input);
    expect(result).toEqual(expected);
  });

  test('應處理64網格邊界值', () => {
    mockPlayer.gridSize = 64;
    const input = { x: 63.9, y: -0.1 };
    const expected = { x: 64, y: 0 };
    const result = normalizePosition(mockPlayer, input);
    expect(result).toEqual(expected);
  });

  test('應拋出錯誤當網格尺寸不合法', () => {
    mockPlayer.gridSize = 0;
    expect(() => normalizePosition(mockPlayer, { x: 10, y: 10 }))
      .toThrow('無效網格尺寸');
  });
});

describe('等角投影系統', () => {
  const mockScene = {
    isoProjection: {
      origin: { setTo: jest.fn() }
    },
    add: {
      isoSprite: jest.fn().mockImplementation(() => ({
        setScale: jest.fn()
      }))
    }
  };

  beforeAll(() => {
    initIsometric(mockScene);
  });

  test('應正確初始化投影原點', () => {
    expect(mockScene.isoProjection.origin.setTo)
      .toHaveBeenCalledWith(0.5, 0.2);
  });

  test('應正確轉換等角座標', () => {
    const result = isoTransform.call(mockScene, { x: 100, y: 200, z: 50 });
    expect(result).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number)
    });
  });

  test('物件渲染應包含Z軸排序', () => {
    const gameObjects = [
      { x: 100, y: 100, z: 50, texture: 'tree' },
      { x: 200, y: 200, z: 30, texture: 'rock' }
    ];
    
    drawScene(mockScene, gameObjects);
    
    // 驗證渲染順序應依Z軸由小到大
    const callOrder = mockScene.add.isoSprite.mock.calls.map(args => args[2]);
    expect(callOrder).toEqual([30, 50]);
  });
});