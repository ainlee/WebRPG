/**
 * @typedef {import('../types/core').Coordinate} Coordinate
 * @typedef {import('../types/core').PathfindingConfig} PathfindingConfig
 */

/**
 * 基礎移動速度 (像素/秒)
 * @type {number}
 */
export const BASE_MOVEMENT_SPEED = 180;

/**
 * 碰撞容錯半徑 (像素)
 * @type {number}
 */
export const FAULT_TOLERANCE_RADIUS = 12;

/**
 * 路徑尋找演算法設定
 * @type {PathfindingConfig}
 */
export const PATHFINDING_SETTINGS = {
  HEURISTIC_WEIGHT: 1.2,
  DIAGONAL_COST: Math.sqrt(2),
  MAX_ITERATIONS: 1000,
  ALLOW_DIAGONAL: true
};

/**
 * 地圖循環邊界緩衝區
 * @type {number}
 */
export const MAP_WRAP_BUFFER = 48;

/**
 * 網格系統尺寸 (像素/網格單位)
 * @type {number}
 */
export const GRID_SIZE = 32;

/**
 * 移動校準容錯範圍
 * @type {number}
 */
export const MOVEMENT_TOLERANCE = 3.2; // 32px網格尺寸的10%