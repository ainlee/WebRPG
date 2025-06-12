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
   * 2D轉2.5D坐標轉換
   * @param {number} x X軸坐標
   * @param {number} y Y軸坐標
   * @param {number} [z=0] 深度值
   * @returns {Object} 轉換後坐標 {x, y, z}
   */
  projectTo2_5D(x, y, z = 0) {
    const projectedX = this.projectionMatrix[0] * x + this.projectionMatrix[3] * y;
    const projectedY = this.projectionMatrix[1] * x + this.projectionMatrix[4] * y;
    return {
      x: projectedX * this.tileSize,
      y: projectedY * this.tileSize - z * 0.5 * this.tileSize,
      z: z
    };
  }

  /**
   * 更新深度緩衝
   * @param {number} x 畫布X坐標
   * @param {number} y 畫布Y坐標
   * @param {number} depth 深度值
   */
  updateDepthBuffer(x, y, depth) {
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