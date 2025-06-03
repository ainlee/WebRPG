/*alert("測試 core.js 有執行");*/

let gameInstance = null; // 保存遊戲實例

export function initializeGame(config) {
  try {
    if (!config) throw new Error('Phaser 配置物件未定義');
    // 支持單個場景或場景陣列
    const scenes = config.scene || config.scenes;
    if (!scenes || (Array.isArray(scenes) && scenes.length === 0)) {
      throw new Error('未定義遊戲場景');
    }
    // 確保場景以陣列形式存在
    config.scenes = Array.isArray(scenes) ? scenes : [scenes];
    
    // 增加防禦性檢查
    const requiredConfigProps = ['type', 'width', 'height', 'parent', 'scene'];
    requiredConfigProps.forEach(prop => {
      if (!(prop in config)) throw new Error(`Phaser 配置缺少必要屬性: ${prop}`);
    });

    if (gameInstance) {
      gameInstance.destroy(true);
    }
    
    // 增加調試選項
    const debugConfig = {
      ...config,
      fps: {
        target: 60,
        forceSetTimeOut: true
      },
      callbacks: {
        postBoot: (game) => {
          console.log('Phaser 遊戲實例初始化完成', game);
        }
      }
    };
    
    gameInstance = new Phaser.Game(debugConfig);
    
    // 強制重繪畫面
    setTimeout(() => {
      if (gameInstance && gameInstance.renderer) {
        gameInstance.renderer.resize(window.innerWidth, window.innerHeight);
        console.log('強制重繪畫面完成');
      }
    }, 500);

  } catch (error) {
    console.error('Phaser 初始化失敗:', error);
    return null;
  }

  // 添加 resize 事件監聽器，以便在視窗大小改變時調整遊戲尺寸
  if (!window._resizeListenerRegistered) {
    window.addEventListener('resize', () => {
      if (typeof window.recreateGame === 'function') {
        window.recreateGame();
      }
    }, false);
    window._resizeListenerRegistered = true;
  }

  return gameInstance;
}

export function calculateGameSize() {
  // 增加防禦性檢查和錯誤處理
  try {
    if (typeof window === 'undefined') {
      throw new Error('無法在非瀏覽器環境中執行');
    }
    
    const width = Math.max(1, Math.floor(window.innerWidth));
    const height = Math.max(1, Math.floor(window.innerHeight));
    
    if (isNaN(width) || isNaN(height)) {
      throw new Error(`計算出無效的畫布尺寸: ${width}x${height}`);
    }
    
    console.log(`計算畫布尺寸: ${width}x${height}`);
    return { width, height, margin: 0 };
    
  } catch (error) {
    console.error('計算畫布尺寸時發生錯誤:', error);
    // 退回安全預設值
    return { width: 800, height: 600, margin: 0 };
  }
}

export function applyPixelScaling(originalSize) {
  try {
    if (typeof originalSize !== 'number' || originalSize <= 0) {
      throw new Error(`原始尺寸必須為正數，收到: ${originalSize}`);
    }
    const targetSize = 48;
    const scale = targetSize / originalSize;
    console.log(`像素縮放計算: ${originalSize} → ${scale}`);
    return scale;
  } catch (error) {
    console.error('像素縮放計算錯誤:', error);
    return 1; // 退回預設值
  }
}