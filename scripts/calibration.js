import { MOVEMENT_TOLERANCE } from './constants.js';

/**
 * 校準系統核心類別
 */
export class CalibrationSystem {
  constructor() {
    this.rawPath = [];
    this.calibratedPath = [];
  }

  /**
   * 分析原始路徑數據
   * @param {Array<{x: number, y: number, timestamp: number}>} path - 原始路徑數據
   */
  analyze(path) {
    this.rawPath = [...path];
    this.calibratedPath = this.applyCalibration(path);
  }

  /**
   * 取得校準後路徑
   * @returns {Array<{x: number, y: number}>}
   */
  getCalibratedPath() {
    return [...this.calibratedPath];
  }

  /**
   * 應用校準演算法
   * @private
   */
  applyCalibration(rawPath) {
    return rawPath.map(point => ({
      x: this.roundToGrid(point.x, MOVEMENT_TOLERANCE),
      y: this.roundToGrid(point.y, MOVEMENT_TOLERANCE)
    }));
  }

  /**
   * 網格對齊演算
   * @private
   */
  roundToGrid(value, tolerance) {
    const gridSize = 1 / (tolerance * 2);
    return Math.round(value * gridSize) / gridSize;
  }
}