/**
 * 2.5D坐標系統核心模組
 * @class
 */
export class CoordinateSystem {
  /**
   * 建構函式
   * @param {Object} config 配置參數
   * @param {number} config.canvasWidth 畫布寬度
   * @param {number} config.canvasHeight 畫布高度
   * @param {number} config.tileSize 基礎瓦片尺寸
   */
  constructor({ canvasWidth, canvasHeight, tileSize }) {
    /** @type {Float32Array} 深度緩衝陣列 */
    this.depthBuffer = new Float32Array(canvasWidth * canvasHeight).fill(1.0);
    this.tileSize = tileSize;
    this.projectionMatrix = [
      1, 0, 0,
      0.5, 0.866, 0, // 60度等角投影
      0, 0, 1
    ];
  }

  /**
   * 2D轉2.5D坐標轉換（等角投影）
   * @param {number} x X軸坐標
   * @param {number} y Y軸坐標
   * @param {number} [z=0] 深度值
   * @returns {Object} 轉換後坐標 {x, y, z}
   */
  projectTo2_5D(x, y, z = 0) {
    const isoScale = 0.866; // cos(30°)
    return {
      x: (x - y) * isoScale * this.tileSize,
      y: ((x + y) / 2 - z * 0.5) * isoScale * this.tileSize,
      z: z
    };
  }

import { CoordinateSystem } from './core/CoordinateSystem.js';

/**
 * 等角投影轉換器類別
 * @class
 */
export class IsometricProjector extends CoordinateSystem {
  constructor(config) {
    super(config);
    this.tileSize = config.tileSize || 64;
    this.isoScale = config.isoScale || 0.5;
  }

  /**
   * 執行3D到2D等角投影轉換
   * @param {number} x - X軸座標
   * @param {number} y - Y軸座標
   * @param {number} z - Z軸高度
   * @returns {Object} 投影後座標
   */
  project(x, y, z) {
    return {
      x: (x - y) * this.tileSize * this.isoScale,
      y: ((x + y) / 2 - z * 0.5) * this.tileSize * this.isoScale
    };
  }

  /**
   * 平面座標轉換（二維投影）
   * @param {number} x - X軸座標
   * @param {number} y - Y軸座標
   * @returns {Object} 投影後座標
   */
  project2D(x, y) {
    const angle = this.config?.angle || 30;
    const scaleY = this.config.scaleY;
    const depthFactor = this.config.depthFactor;
    const rad = angle * Math.PI / 180;
    return {
      x: x + y * Math.cos(rad) * scaleY,
      y: y * Math.sin(rad) * scaleY * (1 - y * depthFactor)
    };
  }
  /**
   * 建構子
   * @param {Object} config - 視覺設定參數
   */
  constructor(config) {
    this.tileSize = config.tileSize || 64;
    this.isoScale = config.isoScale || 0.5;
  }

  /**
   * 執行3D到2D等角投影轉換
   * @param {number} x - X軸座標
   * @param {number} y - Y軸座標
   * @param {number} z - Z軸高度
   * @returns {Object} 投影後座標
   */
  project(x, y, z) {
    return {
      x: (x - y) * this.tileSize * this.isoScale,
      y: ((x + y) / 2 - z * 0.5) * this.tileSize * this.isoScale
    };
  }

}
  /**
   * 平面座標轉換（二維投影）
   * @param {number} x - X軸座標
   * @param {number} y - Y軸座標
   * @returns {Object} 投影後座標
   */
  project2D(x, y) {
    const angle = this.config?.angle || 30;
    const scaleY = this.config.scaleY;
    const depthFactor = this.config.depthFactor;
    const rad = angle * Math.PI / 180;
    return {
      x: x + y * Math.cos(rad) * scaleY,
      y: y * Math.sin(rad) * scaleY * (1 - y * depthFactor)
    };
  }
}

  /**
   * 更新深度緩衝
   * @param {number} x 畫布X坐標
   * @param {number} y 畫布Y坐標
   * @param {number} depth 深度值
   */
  updateDepthBuffer(x, y, depth) {
    const canvasWidth = this.canvasWidth;
    const canvasWidth = 800; // 明確定義畫布寬度
    const index = Math.floor(y) * canvasWidth + Math.floor(x);
    if (index >= 0 && index < this.depthBuffer.length) {
      if (depth < this.depthBuffer[index]) {
        this.depthBuffer[index] = depth;
      }
    } else {
      console.warn(`[DepthBuffer] 無效索引 ${index} (x:${x}, y:${y})`);
    }
  }

  /** 重置深度緩衝 */
  resetDepthBuffer() {
    this.depthBuffer.fill(1.0);
  }
}