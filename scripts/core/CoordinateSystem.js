/**
 * 整合版座標系統核心類別
 * @class
 */
export class CoordinateSystem {
  constructor({ canvasWidth = 800, canvasHeight = 600, ...config }) {
    this.config = {
      tileSize: 32,
      canvasWidth,
      canvasHeight,
      fov: 45,
      aspect: canvasWidth / canvasHeight,
      near: 0.1,
      far: 1000,
      ...config
    };
  }

  /**
   * 帶有透視縮放的投影（2.5D專用）
   * @param {number} x - X軸座標
   * @param {number} y - Y軸座標
   * @returns {Object} 投影後座標與縮放比例
   */
  // 新增3D投影核心方法
  project3D(x, y, z) {
    const viewMatrix = this.createViewMatrix();
    const projMatrix = this.createPerspectiveMatrix();
    const point = this.multiplyMatrixVector(
      this.matrixMultiply(projMatrix, viewMatrix),
      [x, y, z, 1]
    );
    return {
      x: (point[0]/point[3] + 1) * this.config.canvasWidth/2,
      y: (1 - point[1]/point[3]) * this.config.canvasHeight/2,
      z: point[2]/point[3]
    };
  }

  projectWithScale(x, y) {
    const base = this.project3D(x, y, 0);
    const scale = this.config.near -
                 y * this.config.depthFactor;
    return {
      ...base,
      scale: Math.max(this.config.far, scale)
    };
  }

  // 新增矩陣運算工具
  createPerspectiveMatrix() {
    const { fov, aspect, near, far } = this.config;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const f = 1.0 / Math.tan(fovRad);
    const rangeInv = 1.0 / (near - far);
    
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * rangeInv, (2 * far * near) * rangeInv,
      0, 0, -1, 0
    ];
  }

  createViewMatrix() {
    // 調整攝影機位置至正Z軸方向
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, -1, 0,  // 看向負Z軸
      0, 0, 5, 1    // 攝影機位於Z=5
    ];
  }

  matrixMultiply(a, b) {
    const result = new Array(16).fill(0);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        for (let i = 0; i < 4; i++) {
          result[row * 4 + col] += a[row * 4 + i] * b[i * 4 + col];
        }
      }
    }
    return result;
  }

  multiplyMatrixVector(m, v) {
    const result = new Array(4).fill(0);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        result[row] += m[row * 4 + col] * v[col];
      }
    }
    return result;
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
      zIndex: y, // 用於深度排序
      depth: y * this.config.depthFactor
    };
  }

  /**
   * 世界座標轉螢幕座標（2D專用）
   * @param {number} worldX - 世界座標X
   * @param {number} worldY - 世界座標Y
   * @returns {Object} 螢幕座標物件
   */
  worldToScreen(worldX, worldY, worldZ = 0) {
    const { angle, scaleY, depthFactor } = visualConfig.projection.perspective;
    const radian = (angle * Math.PI) / 180;
    const depthScale = 1 - (worldZ * depthFactor);
    
    return {
      x: (worldX - worldY) * this.config.tileSize * Math.cos(radian) * depthScale + (window.innerWidth / 2),
      y: (worldX + worldY) * this.config.tileSize * Math.sin(radian) * scaleY * depthScale * 0.5 + (window.innerHeight / 2),
      zIndex: worldY + worldZ * 0.1
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