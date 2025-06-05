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
        // 顯示黃色路徑點（主角層下方，depth -11）
        if (scene && scene.add) {
          if (!window._navDots) window._navDots = [];
          window._navDots.forEach(dot => dot.destroy());
          window._navDots = path.map((pt, idx) => {
            const dot = scene.add.circle(pt.x, pt.y, tileSize/6, 0xffff00, 0.8);
            dot.setDepth(-11); // 比主角低，比石頭低一層
            dot.alpha = 1;
            return dot;
          });
        }
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