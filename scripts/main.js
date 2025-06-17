import * as Phaser from './node_modules/phaser/dist/phaser.esm.js';
import { initializeGame, calculateGameSize } from './core.js';
import { PerspectiveManager } from './perspective.js';
import { init3DScene, createViewToggleButton } from './3d-preview/sceneSetup.js';
export const perspectiveManager = new PerspectiveManager();

// 基本遊戲場景定義（測試用）
class BootScene extends Phaser.Scene {
  preload() {
    this.load.image('logo', 'images/logo.png');
  }
  
  create() {
    this.add.image(400, 300, 'logo');
    console.log('BootScene 初始化完成');
    init3DScene(this);
    createViewToggleButton(this);
  }
}

// 初始化遊戲配置
const gameConfig = {
  type: Phaser.WEBGL,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  scene: [BootScene],
  ...calculateGameSize(),
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    powerPreference: 'high-performance',
    premultipliedAlpha: false,
    preserveDrawingBuffer: true
  }
};

/**
 * 初始化視角管理系統
 * 綁定UI控制按鈕與模式切換事件監聽
 */
function initPerspectiveSystem() {
  const perspectiveButton = document.getElementById('perspective-toggle');
  if (perspectiveButton) {
    perspectiveButton.addEventListener('click', () => {
      console.log('[按鈕事件] 開始切換視角模式', {
        currentMode: perspectiveManager.mode,
        methodExists: perspectiveManager.toggleProjectionMode instanceof Function
      });
      perspectiveManager.toggleProjectionMode();
      console.log('[按鈕事件] 新視角模式:', perspectiveManager.mode, {
        sceneActive: window.gameInstance?.scene?.scenes[0]?.scene?.isActive(),
        renderCount: window.gameInstance.renderer.renderCount
      });
      window.gameInstance.scene.scenes[0].scene.render();
      console.log('[渲染觸發] 手動調用scene.render()完成');
    });
  }

  // 監聽模式切換事件
  document.addEventListener('perspectiveModeChanged', (event) => {
    console.log('收到視角模式變更事件:', event.detail.mode);
    window.dispatchEvent(new CustomEvent('renderUpdateRequired'));
  });
}

// 啟動遊戲
console.log('正在初始化遊戲引擎...');
try {
  const game = initializeGame(gameConfig);
  initPerspectiveSystem();
  if (game) {
    window.gameInstance = game;
    console.log('Phaser 遊戲實例創建成功:', game);
  }
} catch (error) {
  console.error('遊戲初始化失敗:', error);
}