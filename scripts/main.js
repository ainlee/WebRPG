import * as Phaser from 'phaser';
import { initializeGame, calculateGameSize } from './core.js';

// 基本遊戲場景定義（測試用）
class BootScene extends Phaser.Scene {
  preload() {
    this.load.image('logo', 'images/logo.png');
  }
  
  create() {
    this.add.image(400, 300, 'logo');
    console.log('BootScene 初始化完成');
  }
}

// 初始化遊戲配置
const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  scene: [BootScene],
  ...calculateGameSize(),
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 啟動遊戲
console.log('正在初始化遊戲引擎...');
try {
  const game = initializeGame(gameConfig);
  if (game) {
    window.gameInstance = game;
    console.log('Phaser 遊戲實例創建成功:', game);
  }
} catch (error) {
  console.error('遊戲初始化失敗:', error);
}