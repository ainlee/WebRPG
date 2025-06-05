import { describe, test, expect, beforeEach } from 'vitest';
import { normalizePosition } from './gameLogic';
import { MOVEMENT_TOLERANCE } from './constants';
import { PathParticleSystem } from './graphics.js';
import { CalibrationSystem } from './calibration.js';

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
    expect(Math.abs(result.x - expected.x)).toBeLessThanOrEqual(mockPlayer.gridSize * 0.1 * 2);
  });

  test('應拋出錯誤當網格尺寸不合法', () => {
    mockPlayer.gridSize = 0;
    expect(() => normalizePosition(mockPlayer, { x: 10, y: 10 }))
      .toThrow('無效網格尺寸');
  });
});


describe('路徑粒子系統', () => {
  let particleSystem;

  beforeEach(() => {
    particleSystem = new PathParticleSystem();
  });

  test('應正確初始化粒子池', () => {
    expect(particleSystem.pool.length).toBe(500);
  });

  test('發射粒子應增加活動粒子數量', () => {
    const testPath = [{x: 0, y: 0}, {x: 1, y: 1}];
    particleSystem.emit(testPath);
    expect(particleSystem.particles.length).toBe(testPath.length);
  });

  test('更新後應移除生命週期結束的粒子', () => {
    const testPath = [{x: 0, y: 0}];
    particleSystem.emit(testPath);
    particleSystem.update();
    expect(particleSystem.particles.length).toBeLessThanOrEqual(1);
  });
});

describe('校準模組', () => {
  let calibrationSystem;
  
  beforeEach(() => {
    calibrationSystem = new CalibrationSystem();
  });

  test('應在誤差範圍內計算移動軌跡', () => {
    // Arrange
    const inputPath = [
      { x: 0, y: 0, timestamp: 0 },
      { x: 1.1, y: 0.9, timestamp: 1000 }
    ];
    const expected = { x: 1, y: 1 };

    // Act
    calibrationSystem.analyze(inputPath);
    const result = calibrationSystem.getCalibratedPath()[1];

    // Assert
    expect(Math.abs(result.x - expected.x)).toBeLessThanOrEqual(MOVEMENT_TOLERANCE);
    expect(Math.abs(result.y - expected.y)).toBeLessThanOrEqual(MOVEMENT_TOLERANCE);
  });

  test('應正確處理空路徑輸入', () => {
    calibrationSystem.analyze([]);
    expect(calibrationSystem.getCalibratedPath()).toHaveLength(0);
  });
}); // 新增結束大括號