// UI 投影系統元件（符合規格書 v2.5.1）
export class UIProjector {
  constructor(scene) {
    this.scene = scene;
    this.offset = { x: 0, y: 0 };
    log('UI投影系統初始化完成', 'system');
  }

  /**
   * 更新攝影機偏移量
   * @param {number} targetX - 目標X軸偏移
   * @param {number} targetY - 目標Y軸偏移
   */
  updateCameraOffset(targetX, targetY) {
    this.offset.x = Math.floor(targetX);
    this.offset.y = Math.floor(targetY);
    // 同步到玩家物件以保持向下相容
    if (this.scene.player) {
      this.scene.player.cameraOffsetX = this.offset.x;
      this.scene.player.cameraOffsetY = this.offset.y;
    }
    log(`攝影機偏移更新至: X=${this.offset.x}, Y=${this.offset.y}`, 'debug');
  }

  /**
   * 將世界座標轉換為螢幕座標
   * @param {number} worldX - 世界座標X軸
   * @param {number} worldY - 世界座標Y軸
   * @returns {Object} 螢幕座標物件
   */
  project(worldX, worldY) {
    return {
      x: worldX - this.offset.x,
      y: worldY - this.offset.y
    };
  }
}