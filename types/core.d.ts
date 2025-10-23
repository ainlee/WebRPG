/**
 * 核心類型定義檔
 */

/** 座標介面 */
export interface Coordinate {
  x: number;
  y: number;
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