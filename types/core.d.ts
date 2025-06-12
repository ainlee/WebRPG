/**
 * 核心類型定義檔
 */

/** 二維座標介面 */
export interface Coordinate {
  x: number;
  y: number;
}

/** 2.5D三維座標介面 */
export interface Coordinate3D extends Coordinate {
  z: number;
}

/** 深度映射參數類型 */
export interface DepthMappingConfig {
  /** 畫布寬度 */
  canvasWidth: number;
  /** 畫布高度 */
  canvasHeight: number;
  /** 最大深度值 */
  maxDepth?: number;
}

/** 路徑尋找設定介面 */
export interface PathfindingConfig {
  /** 啟發函數權重值 */
  HEURISTIC_WEIGHT: number;
  /** 斜向移動成本值 */
  DIAGONAL_COST: number;
  /** 最大迭代次數 */
  MAX_ITERATIONS: number;
  /** 是否允許斜向移動 */
  ALLOW_DIAGONAL: boolean;
}

/** 地形類型列舉 */
export enum TerrainType {
  PLAINS = 'plains',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  WATER = 'water'
}