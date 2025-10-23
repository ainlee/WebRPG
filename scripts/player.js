/**
 * 玩家角色模組
 */
export const player = {
  x: 0,
  y: 0,
  speed: 5,
  moveDirection: null,
  sprite: null,
  
  // 移動方法
  move(direction) {
    this.moveDirection = direction;
  },
  
  // 停止移動
  stop() {
    this.moveDirection = null;
  }
};