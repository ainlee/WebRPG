/**
 * 整合版座標系統核心類別
 * @class
 */
export class CoordinateSystem {
  constructor({ canvasWidth, ...config }) {
    this.config = {
      tileSize: 32,
      ...config
    };
  }

  /**
   * 帶有透視縮放的投影（2.5D專用）
   * @param {number} x - X軸座標
   * @param {number} y - Y軸座標
   * @returns {Object} 投影後座標與縮放比例
   */
  projectWithScale(x, y) {
    const base = this.project(x, y);
    const scale = this.config.near -
                 y * this.config.depthFactor;
    return {
      ...base,
      scale: Math.max(this.config.far, scale)
    };
  }

  /**
   * 執行斜投影轉換（2.5D專用）
   * @param {number} x - X軸原始座標
   * @param {number} y - Y軸原始座標
   * @returns {Object} 投影後座標
   */
  project(x, y) {
    const { angle, scaleY, depthFactor } = this.config;
    const radian = angle * (Math.PI / 180);
    return {
      x: x + y * Math.cos(radian) * scaleY,
      y: y * Math.sin(radian) * scaleY * (1 - y * depthFactor),
      zIndex: y // 用於深度排序
    };
  }

  /**
   * 世界座標轉螢幕座標（2D專用）
   * @param {number} worldX - 世界座標X
   * @param {number} worldY - 世界座標Y
   * @returns {Object} 螢幕座標物件
   */
  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.config.tileSize + (window.innerWidth / 2),
      y: worldY * this.config.tileSize + (window.innerHeight / 2)
    };
  }

  /**
   * 螢幕座標轉世界座標（2D專用）
   * @param {number} screenX - 螢幕座標X
   * @param {number} screenY - 螢幕座標Y
   * @returns {Object} 世界座標物件
   */
  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - (window.innerWidth / 2)) / this.config.tileSize,
      y: (screenY - (window.innerHeight / 2)) / this.config.tileSize
    };
  }
}