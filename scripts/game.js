/*alert("測試 game.js 有執行");*/

import { initializeGame, calculateGameSize, applyPixelScaling } from './core.js';
import { setupInput, keysDown } from './input.js';
import { player, updatePlayer, log, setupGame as setupGameLogic, path, keyMoveQueue, tileSize, mapWidth, mapHeight, isCollision } from './gameLogic.js';
import { generateMapLayers, getPlayerStartPos, calculateMapData } from './world.js';

// 控制是否顯示開發者工具面板
window.SHOW_DEV_TOOLS = true;

// 定義靜止幀的映射
const stopFrames = {
  down: 0,
  up: 4,
  left: 8,
  right: 12
};

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.isWaitingForAnimComplete = false;
    this.lastLoggedKeyDirection = null;
    this.playerWasMovingByKey = false;
    this.animationCompleteCallback = null;
    // 如果是場景重啟，保持原有的地圖座標
    this.currentMapX = window._lastMapX || 0;
    this.currentMapY = window._lastMapY || 0;
    this.globalSeed = window._globalSeed || Date.now();
    
    // 保存當前座標以供場景重啟時使用
    window._lastMapX = this.currentMapX;
    window._lastMapY = this.currentMapY;
    window._globalSeed = this.globalSeed;
  }

  preload() {
    this.load.atlas('hero', 'images/行走圖-主角.png', 'images/行走圖-主角.json');
    this.load.image('grass', 'images/map-grass.png');
    this.load.image('stone', 'images/barrier-stone.png');
    this.load.on('progress', (value) => {
      log(`資源載入進度: ${Math.round(value * 100)}%`, "system");
    });
    this.load.on('complete', () => {
      log("資源預載入完成", "system");
    });
  }

  create() {
    log("開始建立遊戲場景...", "system");
    
    // 生成初始地圖
    const mapData = {
      seed: this.globalSeed + this.currentMapX * 10000 + this.currentMapY,
      difficulty: Math.min(Math.abs(this.currentMapX) + Math.abs(this.currentMapY), 10),
      isSpecial: ((Math.abs(this.currentMapX) + Math.abs(this.currentMapY)) % 5) === 0,
      type: window.MAZE_TYPE || 'random'  // 使用全局設置的迷宮類型
    };
    log("正在生成初始地圖數據...", "system");
    console.log("正在生成初始地圖數據...", mapData);
    console.log("調用 generateMapLayers 函數...");
    let ground;
    let objectLayer;
    try {
      const result = generateMapLayers(mapData);
      ground = result.ground;
      objectLayer = result.objectLayer;
      window._objectLayer = objectLayer; // 供碰撞查詢
      log("初始地圖數據生成完成", "system");
      console.log("初始地圖數據生成完成", ground, objectLayer);
    } catch (error) {
      log("地圖生成過程中發生錯誤", "error");
      console.error("地圖生成錯誤:", error);
      // 提供一個默認的地圖數據以繼續遊戲
      const size = 64;
      ground = Array(size).fill().map(() => Array(size).fill(1));
      objectLayer = Array(size).fill().map(() => Array(size).fill(0));
      for (let y = 10; y < 15; y++) {
        for (let x = 10; x < 15; x++) {
          objectLayer[y][x] = 2; // 石頭/障礙物
        }
      }
      window._objectLayer = objectLayer;
      log("使用默認地圖數據繼續遊戲", "system");
      console.log("使用默認地圖數據繼續遊戲", ground, objectLayer);
    }
    console.log("檢查地圖數據", ground, objectLayer);
    log(`地圖數據 - 地板層大小: ${ground.length}x${ground[0].length}`, "debug");
    log(`地圖數據 - 物件層大小: ${objectLayer.length}x${objectLayer[0].length}`, "debug");
    // 檢查物件層是否有障礙物
    let obstacleCount = 0;
    for (let y = 0; y < objectLayer.length; y++) {
      for (let x = 0; x < objectLayer[y].length; x++) {
        if (objectLayer[y][x] === 2) obstacleCount++;
      }
    }
    log(`地圖數據 - 障礙物數量: ${obstacleCount}`, "debug");
    
    // 設定玩家初始位置
    const center = Math.floor(64/2);
    player.x = (center + 0.5) * tileSize;
    player.y = (center + 0.5) * tileSize;
    setupGameLogic();
    this.isWaitingForAnimComplete = false;
    this.lastLoggedKeyDirection = null;
    this.playerWasMovingByKey = false;
    log("玩家初始位置設定完成", "system");

    // 動態渲染地圖（僅渲染當前地圖）
    const mapGraphics = this.add.group();
    const gridSize = 64;
    log("開始動態渲染地圖...", "system");
    console.log("開始動態渲染地圖...", ground, objectLayer);
    // 只生成並渲染當前地圖
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // 地板層
        const tile = this.add.image(x * tileSize + tileSize/2, y * tileSize + tileSize/2, 'grass');
        tile.setDisplaySize(tileSize, tileSize);
        tile.setDepth(-30);
        mapGraphics.add(tile);
        // 物件層
        if (objectLayer[y] && objectLayer[y][x] === 2) {
          const obj = this.add.image(x * tileSize + tileSize/2, y * tileSize + tileSize/2, 'stone');
          obj.setDisplaySize(tileSize, tileSize);
          obj.setDepth(-10);
          mapGraphics.add(obj);
        }
      }
    }
    log("地圖渲染完成", "system");
    console.log("地圖渲染完成");
    log(`渲染了 ${mapGraphics.getLength()} 個地圖元素`, "debug");

    const startX = player.x;
    const startY = player.y;
    this.playerSprite = this.physics.add.sprite(startX, startY, 'hero');
    log("玩家角色創建完成", "system");

    const scale = applyPixelScaling(16);
    this.playerSprite.setScale(scale);
    log("玩家角色縮放設定完成", "system");

    this.cameras.main.setBounds(0, 0, gridSize*tileSize, gridSize*tileSize);
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    log("攝影機設定完成", "system");

    this.createPlayerAnimations();
    log("玩家動畫創建完成", "system");
    setupInput(this);
    log("輸入設定完成", "system");
    this.setupDebugTools();
    log("除錯工具設定完成", "system");

    // 初始設置靜止幀
    const initialFrameIndex = stopFrames[player.direction];
    if (initialFrameIndex !== undefined) {
      const initialFrameName = `行走圖-主角 ${initialFrameIndex}.aseprite`;
      if (this.textures.get('hero').has(initialFrameName)) {
        this.playerSprite.setFrame(initialFrameName);
        log("初始靜止幀設定完成", "system");
      } else {
        log("無法設定初始靜止幀，紋理未找到", "error");
      }
    } else {
      log("無法設定初始靜止幀，幀索引未定義", "error");
    }
    log("遊戲場景建立完成", "system");
  }

  update(time, delta) {
    // 檢查是否需要更新玩家位置到對應的地圖區塊
    const mapSize = 64;
    // 處理地圖過渡（簡化版本）
    const margin = tileSize * 2;
    const worldTileSize = tileSize * mapSize;
    if (player.x < margin) {
      this.currentMapX--;
      player.x = worldTileSize - margin - tileSize;
      this.scene.restart();
    } else if (player.x > worldTileSize - margin) {
      this.currentMapX++;
      player.x = margin + tileSize;
      this.scene.restart();
    }
    
    if (player.y < margin) {
      this.currentMapY--;
      player.y = worldTileSize - margin - tileSize;
      this.scene.restart();
    } else if (player.y > worldTileSize - margin) {
      this.currentMapY++;
      player.y = margin + tileSize;
      this.scene.restart();
    }

    const canMoveByKey = path.length === 0 && keyMoveQueue.length <= 1;
    let newKeyMoveInitiated = false;

    if (canMoveByKey && !this.isWaitingForAnimComplete) { // 當等待動畫完成時，不接受新的鍵盤移動
      let dx = 0;
      let dy = 0;
      let directionKeyPressed = null;

      if (keysDown['w'] || keysDown['arrowup']) { dy = -1; directionKeyPressed = 'up'; }
      else if (keysDown['s'] || keysDown['arrowdown']) { dy = 1; directionKeyPressed = 'down'; }
      else if (keysDown['a'] || keysDown['arrowleft']) { dx = -1; directionKeyPressed = 'left'; }
      else if (keysDown['d'] || keysDown['arrowright']) { dx = 1; directionKeyPressed = 'right'; }

      if (dx !== 0 || dy !== 0) {
        newKeyMoveInitiated = true;
        const halfTile = tileSize / 2;
        const currentGridX = Math.round(player.x / halfTile) * halfTile;
        const currentGridY = Math.round(player.y / halfTile) * halfTile;
        const targetWorldX = currentGridX + dx * halfTile;
        const targetWorldY = currentGridY + dy * halfTile;

        if (!isCollision(targetWorldX, targetWorldY) &&
            targetWorldX >= 0 && targetWorldX <= mapWidth &&
            targetWorldY >= 0 && targetWorldY <= mapHeight)
        {
          // 修正鍵盤移動方向的日誌記錄
          if (!this.playerWasMovingByKey || directionKeyPressed !== this.lastLoggedKeyDirection) {
            log(`鍵盤移動 ${directionKeyPressed}`, 'move');
            this.lastLoggedKeyDirection = directionKeyPressed;
          }
          if (directionKeyPressed) player.direction = directionKeyPressed; // 更新方向以播放正確動畫

          keyMoveQueue.length = 0;
          keyMoveQueue.push(
            { x: player.x, y: player.y },
            { x: targetWorldX, y: targetWorldY }
          );
          // this.isWaitingForAnimComplete = false; // 在 shouldAnimate 中處理
        } else {
          newKeyMoveInitiated = false;
        }
      }
    }
    this.playerWasMovingByKey = newKeyMoveInitiated || keyMoveQueue.length > 1;
    if (!newKeyMoveInitiated && keyMoveQueue.length <=1 && !path.length > 0) {
        this.lastLoggedKeyDirection = null;
    }

    // 傳入 objectLayer 進行碰撞判斷
    updatePlayer(this, delta, window._objectLayer);

    this.playerSprite.x = player.x;
    this.playerSprite.y = player.y;

    const isMovingByKey = keysDown['w'] || keysDown['arrowup'] || keysDown['s'] || keysDown['arrowdown'] || keysDown['a'] || keysDown['arrowleft'] || keysDown['d'] || keysDown['arrowright'];
    const hasMoveTask = path.length > 0 || keyMoveQueue.length > 1;
    const shouldAnimate = hasMoveTask || (isMovingByKey && path.length === 0);

    const currentAnimKey = this.playerSprite.anims.currentAnim?.key;
    const isPlaying = this.playerSprite.anims.isPlaying;

    if (shouldAnimate) {
      this.isWaitingForAnimComplete = false; // 如果要動，就不等待
      // 如果之前有綁定完成事件，先移除
      if (this.animationCompleteCallback && currentAnimKey) {
          this.playerSprite.off(`animationcomplete-${currentAnimKey}`, this.animationCompleteCallback);
          this.animationCompleteCallback = null;
      }

      const animToPlay = `walk_${player.direction}`;
      const animDefinition = this.anims.get(animToPlay);
      if (animDefinition && animDefinition.repeat !== -1) {
          animDefinition.repeat = -1;
      }

      if (!isPlaying || currentAnimKey !== animToPlay) {
        this.playerSprite.play(animToPlay, true);
      }
    } else {
      // 不應該移動
      if (isPlaying && !this.isWaitingForAnimComplete) {
        this.isWaitingForAnimComplete = true;
        const animPlaying = this.playerSprite.anims.currentAnim;

        if (animPlaying) {
          animPlaying.repeat = 0; // 播放完當前循環就停止

          // 移除舊的回調（如果存在）
          if (this.animationCompleteCallback) {
            this.playerSprite.off(`animationcomplete-${animPlaying.key}`, this.animationCompleteCallback);
          }

          // 創建新的回調函數
          this.animationCompleteCallback = () => {
            const stillShouldBeStopped = !( (keysDown['w'] || keysDown['arrowup'] || keysDown['s'] || keysDown['arrowdown'] || keysDown['a'] || keysDown['arrowleft'] || keysDown['d'] || keysDown['arrowright']) && path.length === 0) && !(path.length > 0 || keyMoveQueue.length > 1);

            if (stillShouldBeStopped) {
              this.playerSprite.anims.stop(); // 停止動畫系統
              const frameIndex = stopFrames[player.direction];
              if (frameIndex !== undefined) {
                const frameName = `行走圖-主角 ${frameIndex}.aseprite`;
                if (this.textures.get('hero').has(frameName)) {
                  this.playerSprite.setFrame(frameName);
                }
              }
            }
            // 無論如何，恢復動畫的循環屬性
            const completedAnimDef = this.anims.get(animPlaying.key);
            if (completedAnimDef) {
                completedAnimDef.repeat = -1;
            }
            this.isWaitingForAnimComplete = false;
            this.animationCompleteCallback = null; // 清除回調引用
          };
          this.playerSprite.once(`animationcomplete-${animPlaying.key}`, this.animationCompleteCallback);
        } else {
          // 沒有當前動畫卻在播放？直接停止
          this.playerSprite.anims.stop();
          this.isWaitingForAnimComplete = false;
          const frameIndex = stopFrames[player.direction];
          if (frameIndex !== undefined) this.playerSprite.setFrame(`行走圖-主角 ${frameIndex}.aseprite`);
        }
      } else if (!isPlaying && !this.isWaitingForAnimComplete) {
        // 既沒在播放，也沒在等待完成，確保是靜止幀
        const frameIndex = stopFrames[player.direction];
        if (frameIndex !== undefined) {
            const frameName = `行走圖-主角 ${frameIndex}.aseprite`;
            if (this.playerSprite.frame.name !== frameName && this.textures.get('hero').has(frameName)) {
                this.playerSprite.setFrame(frameName);
            }
        }
      }
    }
  }

  createPlayerAnimations() {
    const directions = ['down', 'up', 'left', 'right'];
    const frameSequences = [
      [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]
    ];
    directions.forEach((direction, index) => {
      const animKey = `walk_${direction}`;
      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: frameSequences[index].map(frame => ({ key: 'hero', frame: `行走圖-主角 ${frame}.aseprite` })),
          frameRate: 8, // 稍微提高幀率，讓動畫更流暢一點
          repeat: -1 // 預設循環播放
        });
        log(`創建動畫: ${animKey}`, "debug");
      }
    });
  }

  setupDebugTools() {
    const toggleDebugButton = document.getElementById('toggle-debug');
    const resetGameButton = document.getElementById('reset-game');
    const generateTunnelMazeButton = document.getElementById('generate-tunnel-maze');
    const generateRandomMazeButton = document.getElementById('generate-random-maze');

    if (toggleDebugButton) {
      toggleDebugButton.addEventListener('click', () => {
        const arcadePhysics = this.physics.world;
        arcadePhysics.drawDebug = !arcadePhysics.drawDebug;
        arcadePhysics.debugGraphic.clear();
        log(`切換除錯模式：${arcadePhysics.drawDebug ? '開啟' : '關閉'}`, 'debug');
      });
    }
    if (resetGameButton) {
      resetGameButton.addEventListener('click', () => {
        log('遊戲已重置', 'system');
        this.scene.restart();
      });
    }
    if (generateTunnelMazeButton) {
      generateTunnelMazeButton.addEventListener('click', () => {
        log('正在重新生成：通道型迷宮', 'system');
        window.MAZE_TYPE = 'tunnel';
        // 重置地圖位置和種子
        window._lastMapX = 0;
        window._lastMapY = 0;
        window._globalSeed = Date.now();
        window.recreateGame && window.recreateGame();
      });
    }
    if (generateRandomMazeButton) {
      generateRandomMazeButton.addEventListener('click', () => {
        log('正在重新生成：隨機分佈型迷宮', 'system');
        window.MAZE_TYPE = 'random';
        // 重置地圖位置和種子
        window._lastMapX = 0;
        window._lastMapY = 0;
        window._globalSeed = Date.now();
        window.recreateGame && window.recreateGame();
      });
    }
  }
}

function createGameConfig() {
  const gameSize = calculateGameSize();
  return {
    type: Phaser.AUTO,
    parent: 'game-container', // 必須是字串
    width: gameSize.width,
    height: gameSize.height,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: gameSize.width,
      height: gameSize.height
    },
    physics: { default: 'arcade', arcade: { debug: false, gravity: { y: 0 } } },
    scene: MainScene,
    pixelArt: true,
    render: { antialias: false, pixelArt: true, roundPixels: true }
  };
}

function startGame() {
  const config = createGameConfig();
  initializeGame(config);
  log("Phaser 遊戲已初始化", "system");
}

window.recreateGame = startGame;

startGame();
