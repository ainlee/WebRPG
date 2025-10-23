/**
 * 視口邊界檢查模組
 * @module ViewportBoundary
 * @requires ./CoordinateSystem
 */
import { CoordinateSystem } from './CoordinateSystem.js';

/**
 * 視口邊界檢查類別
 * @class
 */
export class ViewportBoundary {
  /**
   * 建構式
   * @param {HTMLCanvasElement} canvas - 畫布元素
   * @param {CoordinateSystem} coordinateSystem - 座標系統實例
   * @param {Object} [config] - 設定參數
   * @param {number} [config.bufferRatio=0.1] - 緩衝區比例 (10%)
   * @param {number} [config.debounceTime=250] - 防抖時間 (ms)
   * @param {number} [config.tolerance=0.5] - 允許誤差 (px)
   */
  constructor(canvas, coordinateSystem, { 
    bufferRatio = 0.1,
    debounceTime = 250,
    tolerance = 0.5
  } = {}) {
    this.canvas = canvas;
    this.coordinateSystem = coordinateSystem;
    this.bufferRatio = bufferRatio;
    this.debounceTime = debounceTime;
    this.tolerance = tolerance;

    /** @type {Function} 防抖調整函式 */
    this.debouncedAdjust = this.#createDebounce();
    this.#initEventListeners();
  }

  /**
   * 建立防抖函式
   * @private
   * @returns {Function}
   */
  #createDebounce() {
    let timeoutId;
    return (callback) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, this.debounceTime);
    };
  }

  /**
   * 初始化事件監聽
   * @private
   */
  #initEventListeners() {
    window.addEventListener('resize', () => {
      this.debouncedAdjust(() => {
        this.#handleViewportChange();
      });
    });
  }

  /**
   * 處理視口改變事件
   * @private
   */
  #handleViewportChange() {
    const newWidth = this.canvas.clientWidth;
    const newHeight = this.canvas.clientHeight;
    
    if (this.#isResolutionChanged(newWidth, newHeight)) {
      this.coordinateSystem.config.canvasWidth = newWidth;
      this.coordinateSystem.config.canvasHeight = newHeight;
      console.log(`視口尺寸已更新：${newWidth}x${newHeight}`);
    }
  }

  /**
   * 檢查解析度是否改變
   * @private
   * @param {number} newWidth - 新寬度
   * @param {number} newHeight - 新高度
   * @returns {boolean}
   */
  #isResolutionChanged(newWidth, newHeight) {
    return Math.abs(newWidth - this.coordinateSystem.config.canvasWidth) > this.tolerance ||
           Math.abs(newHeight - this.coordinateSystem.config.canvasHeight) > this.tolerance;
  }

  /**
   * 檢查座標是否在視口邊界內
   * @public
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @returns {boolean}
   */
  checkViewportBoundaries(x, y) {
    const projected = this.coordinateSystem.project3D(x, y, 0);
    const bufferX = this.coordinateSystem.config.canvasWidth * this.bufferRatio;
    const bufferY = this.coordinateSystem.config.canvasHeight * this.bufferRatio;

    return projected.x >= -bufferX &&
           projected.x <= this.coordinateSystem.config.canvasWidth + bufferX &&
           projected.y >= -bufferY &&
           projected.y <= this.coordinateSystem.config.canvasHeight + bufferY;
  }
}