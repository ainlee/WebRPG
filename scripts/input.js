/*alert("測試 input.js 有執行");*/

import { player, mapWidth, mapHeight, tileSize, trees, path, keyMoveQueue, log, isCollision, aStar } from './gameLogic.js';

// 導出一個物件來追蹤按下的鍵
export let keysDown = {};

// 防止重複註冊鍵盤事件的旗標
let keyboardRegistered = false;

export function setupInput(scene) {
  // 處理滑鼠點擊事件
  scene.input.on('pointerdown', (pointer) => {
    const worldPoint = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    let targetX = Math.floor(worldPoint.x / tileSize) * tileSize;
    let targetY = Math.floor(worldPoint.y / tileSize) * tileSize;
    const objectLayer = window._objectLayer;
    if (targetX >= 0 && targetX < mapWidth && targetY >= 0 && targetY < mapHeight && !isCollision(targetX, targetY, objectLayer)) {
      log(`滑鼠點擊：目標位置 (${targetX}, ${targetY})`, 'input');
      path.length = 0;
      keyMoveQueue.length = 0;
      player.moving = false;
      const startNode = { x: player.x, y: player.y };
      const endNode = { x: targetX + tileSize / 2, y: targetY + tileSize / 2 };
      // 使用新A*尋路
      const calculatedPath = aStar(startNode, endNode, objectLayer);
      if (calculatedPath && calculatedPath.length > 0) {
        path.push(...calculatedPath);
        log(`導航開始：路徑節點數 ${path.length}`, 'nav');
        // 新增路徑點校準
        player.x = Math.round(player.x * GRID_SIZE) / GRID_SIZE;
        player.y = Math.round(player.y * GRID_SIZE) / GRID_SIZE;
        drawPath(scene, path);
      } else {
        log(`無法計算路徑至 (${targetX}, ${targetY})`, 'warning');
      }
    } else {
      log(`無效目標或碰撞：(${targetX}, ${targetY})`, 'warning');
    }
  });

  // 僅註冊一次鍵盤事件，避免重複導致 log 爆量
  if (!keyboardRegistered) {
    // 修正鍵盤事件處理，避免重複記錄
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (!keysDown[key]) {
        keysDown[key] = true;
        const ignoredPureModifierKeys = ['control', 'alt', 'shift', 'meta'];
        if (!ignoredPureModifierKeys.includes(key)) {
          log(`鍵盤按下: ${key}`, 'input');
        }
      }
    });
    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      if (keysDown[key]) {
        delete keysDown[key];
        const ignoredPureModifierKeys = ['control', 'alt', 'shift', 'meta'];
        if (!ignoredPureModifierKeys.includes(key)) {
          log(`鍵盤放開: ${key}`, 'input');
        }
      }
    });
    keyboardRegistered = true;
  }
}

/**
 * 繪製導航路徑小黃點
 * @param {Phaser.Scene} scene - Phaser場景物件
 * @param {Array} pathPoints - 路徑點陣列，格式為{x: number, y: number}
 * @returns {Phaser.GameObjects.Arc[]} 建立的小黃點物件陣列
 * @throws {TypeError} 當傳入參數類型錯誤時
 */
/**
 * 繪製可互動式導航路徑標記
 * @param {Phaser.Scene} scene - Phaser 3 場景實例
 * @param {{x: number, y: number}[]} pathPoints - 路徑座標點陣列
 * @returns {Phaser.GameObjects.Arc[]} 建立的圓形標記陣列
 */
export function drawPath(scene, pathPoints) {
  // 基本參數驗證
  if (!scene?.add?.circle) {
    throw new TypeError('需要有效的 Phaser 場景物件');
  }
  if (!Array.isArray(pathPoints)) {
    throw new TypeError('路徑點必須是陣列格式');
  }

  // 清理舊有標記
  clearExistingPathMarkers();

  // 若無路徑點則提前返回
  if (pathPoints.length === 0) {
    return [];
  }

  // 從常數檔取得設定值
  const { PATH_COLOR, Z_INDEX } = require('./constants.js');
  const MARKER_CONFIG = {
    radius: 19.2,       // 96/5
    fillColor: Number(PATH_COLOR), // 轉換為數值型別
    alpha: 0.8,
    depth: Z_INDEX.PATH_MARKER || 1000
  };

  // 建立新標記點
  const newMarkers = pathPoints.map(pt => {
    const marker = scene.add.circle(
      pt.x,
      pt.y,
      MARKER_CONFIG.radius,
      MARKER_CONFIG.fillColor,
      MARKER_CONFIG.alpha
    );
    
    // 設定顯示屬性
    marker.setDepth(MARKER_CONFIG.depth)
          .setAlpha(MARKER_CONFIG.alpha);

    return marker;
  });

  // 設定互動事件
  setupMarkerInteractions(newMarkers);

  // 儲存全域參考
  window._navDots = newMarkers;
  return newMarkers;
}

/**
 * 清除現有的路徑標記
 */
function clearExistingPathMarkers() {
  if (Array.isArray(window._navDots)) {
    window._navDots.forEach(marker => {
      if (marker.destroy) {
        marker.destroy();
      }
    });
    window._navDots = null;
  }
}

/**
 * 設定標記點互動功能
 * @param {Phaser.GameObjects.Arc[]} markers - 標記點陣列
 */
/**
 * 設定標記點互動功能
 * @param {Phaser.GameObjects.Arc[]} markers - 標記點陣列
 */
function setupMarkerInteractions(markers) {
  markers.forEach(marker => {
    marker
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => marker.setAlpha(1.0))
      .on('pointerout', () => marker.setAlpha(0.8));
  });
}