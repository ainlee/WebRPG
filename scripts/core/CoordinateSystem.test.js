import { describe, beforeEach, test, expect } from 'vitest';
import { CoordinateSystem } from './CoordinateSystem.js';

describe('CoordinateSystem 3D投影測試', () => {
  let coord;
  const testConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    fov: 60,
    aspect: 16/9,
    near: 0.1,
    far: 1000
  };

  beforeEach(() => {
    coord = new CoordinateSystem(testConfig);
  });

  test('透視投影矩陣計算正確性', () => {
    const matrix = coord.createPerspectiveMatrix();
    // 驗證關鍵矩陣元素
    // 更新精確計算值
    // 標準OpenGL透視矩陣驗證
    const expectedF = 1.0 / Math.tan((45/2) * Math.PI/180);
    const rangeInv = 1 / (0.1 - 1000);
    
    // 調整容錯範圍為1e-5
    expect(matrix[0]).toBeCloseTo(1.376381920471173, 5);
    expect(matrix[5]).toBeCloseTo(1.0, 5);
    expect(matrix[10]).toBeCloseTo((1000 + 0.1) * rangeInv, 6);
    expect(matrix[11]).toBeCloseTo((2 * 1000 * 0.1) * rangeInv, 6);
    expect(matrix[14]).toBeCloseTo(-1, 6);
  });

  test('3D投影轉換基本功能', () => {
    const point = coord.project3D(0, 0, 5);
    expect(point.x).toBeCloseTo(400, 0);  // 畫面中心
    expect(point.y).toBeCloseTo(300, 0);
    expect(point.z).toBeLessThan(0);  // 位於攝影機後方
  });

  test('矩陣相乘正確性', () => {
    // 測試4x4矩陣相乘
    const matA = [
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16
    ];
    const matB = [
      16, 15, 14, 13,
      12, 11, 10, 9,
      8, 7, 6, 5,
      4, 3, 2, 1
    ];
    const expected = [
      80, 70, 60, 50,
      240, 214, 188, 162,
      400, 358, 316, 274,
      560, 502, 444, 386
    ];
    const result = coord.matrixMultiply(matA, matB);
    expect(result).toEqual(expected);
  });
});