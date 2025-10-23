/**
 * 視角管理核心類別，整合2D與偽3D模式切換功能
 * @class
 */
export class PerspectiveManager {
  constructor(config) {
    const savedMode = localStorage.getItem('viewMode');
    this.mode = savedMode || '2D'; // 從 localStorage 讀取或預設
    this.config = {
      fov: visualConfig.projection.perspective.angle, // 從設定檔獲取FOV
      canvasWidth: 800,  // 強制設定測試用畫布尺寸
      canvasHeight: 600, // 與測試案例規格一致
      near: 0.1,
      far: 1000,
      tileSize: GRID_SIZE, // 使用統一網格尺寸
      ...config
    };
    console.log('[投影系統] 初始化配置', this.config);
    this.currentProjectionMatrix = mat4.create();
  }

  toggleProjectionMode() {
    const newMode = this.mode === '2D' ? '3D' : '2D';
    if (this.mode === '2D') {
      this.switchToPseudo3D();
    } else {
      this.switchTo2D();
    }
    
    // 記錄日誌
    console.log(`[視角切換] 模式變更: ${this.mode} → ${newMode}`);
    if (visualConfig.viewMode.persistence) {
      localStorage.setItem('viewMode', newMode);
    }
    console.log('[模式切換] 執行結果', {
      method: 'toggleProjectionMode',
      newMode: this.mode,
      hasRenderer: !!window.gameInstance?.renderer,
      config: this.config
    });
    window.dispatchEvent(new CustomEvent('perspectiveModeChanged', {
      detail: { mode: this.mode }
    }));
  }

  /**
   * 切換至2D正交投影模式
   */
  switchTo2D() {
    this.mode = '2D';
    mat4.ortho(
      this.currentProjectionMatrix,
      -this.config.canvasWidth / 2,
      this.config.canvasWidth / 2,
      -this.config.canvasHeight / 2,
      this.config.canvasHeight / 2,
      this.config.near,
      this.config.far
    );
  }

  /**
   * 切換至偽3D透視投影模式
   */
  switchToPseudo3D() {
    this.mode = 'Pseudo3D';
    const aspect = this.config.canvasWidth / this.config.canvasHeight;
    const fovRad = (this.config.fov * Math.PI) / 180;

    // 套用自訂透視投影公式
    const { angle, scaleY, depthFactor } = visualConfig.projection.perspective;
    const radian = (angle * Math.PI) / 180;
    
    mat4.perspective(
      this.currentProjectionMatrix,
      fovRad,
      aspect,
      this.config.near,
      this.config.far
    );
    
    // 手動調整投影矩陣增加視覺透視
    mat4.translate(this.currentProjectionMatrix, this.currentProjectionMatrix,
      [0, -visualConfig.projection.perspective.scaleY * 0.2, 0]);
    mat4.rotateZ(this.currentProjectionMatrix, this.currentProjectionMatrix, radian * 0.3);
    
    console.debug('[3D投影] 最終矩陣', {
      matrix: Array.from(this.currentProjectionMatrix).map(n => n.toFixed(4)),
      appliedParams: { angle, scaleY, depthFactor }
    });
  }

  /**
   * 根據當前模式計算投影矩陣
   * @param {Object} entity - 需投影的實體物件
   * @returns {Float32Array} 投影矩陣
   */
  calculateProjection(entity) {
    if (this.mode === '2D') {
      return this.calculate2DProjection(entity);
    }
    return this.calculatePseudo3DProjection(entity);
  }

  /**
   * 2D正交投影計算
   */
  calculate2DProjection({ x, y, width, height }) {
    const matrix = mat4.create();
    mat4.ortho(
      matrix,
      x - width/2,
      x + width/2,
      y - height/2,
      y + height/2,
      this.config.near,
      this.config.far
    );
    return matrix;
  }

  /**
   * 偽3D透視投影計算
   */
  calculatePseudo3DProjection({ x, y, z, scale }) {
    const matrix = mat4.create();
    const depthFactor = visualConfig.projection.perspective.depthFactor ??
                        visualConfig.postProcessing.perspectiveScale.depthFactor ??
                        0.02;
    console.warn('[深度因子] 最終採用值:', depthFactor, '來源:', {
      projection: visualConfig.projection.perspective.depthFactor,
      postProcessing: visualConfig.postProcessing.perspectiveScale.depthFactor
    });
    const adjustedZ = z * depthFactor;
    
    mat4.translate(matrix, matrix, [x, y, adjustedZ]);
    mat4.scale(matrix, matrix, [scale, scale, scale]);
    mat4.multiply(matrix, this.currentProjectionMatrix, matrix);
    
    // 診斷日誌：記錄3D投影計算過程
    console.debug('[視角系統] 3D投影計算', {
      position: {x, y, z},
      scale,
      finalMatrix: matrix
    });
    
    // 效能計時標記
    performance.mark('3d-projection-end');
    return matrix;
  }

  /**
   * 座標轉換橋接方法 (整合現有CoordinateSystem)
   * @param {number} x - 原始X座標
   * @param {number} y - 原始Y座標
   * @returns {Object} 轉換後座標
   */
  projectCoordinates(x, y) {
    if (this.mode === '2D') {
      return { x: x * this.config.tileSize, y: y * this.config.tileSize };
    }
    return {
      x: x * this.config.tileSize,
      y: y * this.config.tileSize,
      z: y * this.config.depthFactor
    };
  }
}