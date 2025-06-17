/**
 * 3D場景初始化模組 v1.0.0
 * 最後更新：2025-06-16
 */
import { PerspectiveManager } from '../perspective.js';
import { visualConfig } from '../../config/visualConfig.js';

/**
 * 初始化3D場景設定
 * @param {Phaser.Scene} scene - Phaser場景物件
 */
export function init3DScene(scene) {
  // 初始化透視管理器
  const perspective = new PerspectiveManager({
    canvasWidth: scene.sys.game.config.width,
    canvasHeight: scene.sys.game.config.height,
    tileSize: 64
  });

  // 綁定Phaser相機
  scene.cameras.main.setScroll(-scene.scale.width/2, -scene.scale.height/2)
    .setZoom(visualConfig.projection.perspective.scaleY);
  
  // 套用視覺設定
  scene.cameras.main.setRoundPixels(visualConfig.projection.shadowQuality > 1);
  
  // 啟用透視模式
  perspective.switchToPseudo3D();
  
  // 註冊視窗縮放事件
  scene.scale.on('resize', (gameSize) => {
    perspective.config.canvasWidth = gameSize.width;
    perspective.config.canvasHeight = gameSize.height;
    scene.cameras.main.setSize(gameSize.width, gameSize.height);
  });

  // 輸出除錯訊息
  console.log('[3D場景] 初始化完成', {
    camera: scene.cameras.main,
    perspectiveConfig: perspective.config
  });
}

/**
 * 建立視角切換按鈕
 * @param {Phaser.Scene} scene - Phaser場景物件
 */
export function createViewToggleButton(scene) {
  const btn = scene.add.text(10, 10, '切換視角', { 
    fontSize: '16px', 
    backgroundColor: '#222',
    padding: { x: 10, y: 5 },
    fixedSize: { width: 100, height: 30 }
  })
  .setInteractive()
  .on('pointerdown', () => {
    scene.perspective.toggleProjectionMode();
    btn.setText(scene.perspective.mode === '2D' ? '切換3D' : '切換2D');
  });
  return btn;
}
