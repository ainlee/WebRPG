/**
 * 視覺效果全域設定檔
 * 版本：1.0.0
 * 更新日期：2025-06-12
 */
export const visualConfig = {
  // 3D投影設定
  projection: {
    shadowQuality: 2, // 0=關閉, 1=低, 2=中, 3=高
    maxShadowDistance: 1000,
    shadowMapSize: 2048,
    softShadows: true
  },

  // 精靈圖設定
  sprites: {
    maxBatchSize: 1000,
    mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
    anisotropicLevel: 4
  },

  // 硬體加速設定
  hardwareAcceleration: {
    /** 
     * GPU實例化繪製
     * 啟用後會使用ANGLE_instanced_arrays擴展
     */
    instancedRendering: true,
    /** 
     * 頂點緩衝物件(VBO)使用策略
     * static: 內容不常更新
     * dynamic: 內容偶爾更新
     * stream: 每幀更新
     */
    bufferUsage: 'dynamic',
    /** 
     * 視覺效果品質等級
     * low: 適合低階裝置
     * medium: 平衡模式
     * high: 最佳品質
     */
    qualityPreset: 'medium'
  },

  // 後處理效果
  postProcessing: {
    bloom: {
      enabled: true,
      threshold: 0.8,
      intensity: 0.6
    },
    ssao: {
      enabled: false,
      radius: 0.5,
      samples: 16
    }
  }
};