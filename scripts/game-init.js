/**
 * 游戏初始化脚本 - 简化版
 */
import Phaser from 'phaser';
import { GRID_SIZE } from './constants.js';
import { player } from './player.js';

// 游戏场景
export class MainScene extends Phaser.Scene {
  preload() {
    // 加载资源
    this.load.image('grass', 'images/map-grass.png');
    this.load.image('stone', 'images/barrier-stone.png');
    this.load.spritesheet('player', 'images/行走圖-主角.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  create() {
    // 创建地图
    const size = 64;
    const tileSize = GRID_SIZE;
    const ground = this.createGround(size, tileSize);
    const objectLayer = this.createObjects(size, tileSize);
    
    // 创建玩家
    this.createPlayer(tileSize);
    
    // 开发者工具初始化
    this.setupDevTools();
  }

  createGround(size, tileSize) {
    // 创建草地层
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        this.add.image(x * tileSize, y * tileSize, 'grass')
          .setDisplaySize(tileSize, tileSize)
          .setDepth(-30);
      }
    }
  }

  createObjects(size, tileSize) {
    const objects = [];
    // 创建障碍物
    for (let y = 10; y < 15; y++) {
      for (let x = 10; x < 15; x++) {
        const obj = this.add.image(x * tileSize, y * tileSize, 'stone')
          .setDisplaySize(tileSize, tileSize)
          .setDepth(-10);
        objects.push(obj);
      }
    }
    return objects;
  }

  createPlayer(tileSize) {
    // 创建玩家精灵
    player.sprite = this.add.sprite(
      32 * tileSize, 
      32 * tileSize, 
      'player'
    );
    
    // 设置玩家属性
    player.sprite.setDisplaySize(tileSize * 2, tileSize * 2);
    player.sprite.setDepth(10);
    player.sprite.setOrigin(0.5, 0.5);
    
    // 添加动画
    this.anims.create({
      key: 'player-idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    player.sprite.play('player-idle');
  }

  setupDevTools() {
    // 开发者工具事件绑定
    document.getElementById('minimize-dev-tools')?.addEventListener('click', () => {
      const devTools = document.getElementById('dev-tools');
      devTools.classList.toggle('expanded');
    });
    
    // 其他功能绑定...
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [MainScene],
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 启动游戏
new Phaser.Game(config);