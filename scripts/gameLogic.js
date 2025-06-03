<<<<<<< HEAD
'use strict';

=======
>>>>>>> f9f5766 (first commit)
import {
  BASE_MOVEMENT_SPEED,
  FAULT_TOLERANCE_RADIUS,
  PATHFINDING_SETTINGS
} from './constants.js';

<<<<<<< HEAD
// 初始設定
export let tileSize = 48;
=======
export let tileSize = 48;

export function normalizePosition(player, input) {
  const gridSize = player.gridSize;
  if (gridSize <= 0) {
    throw new Error('無效網格尺寸');
  }
  
  return {
    x: Math.round((input.x - player.position.x) / gridSize) * gridSize + player.position.x,
    y: Math.round((input.y - player.position.y) / gridSize) * gridSize + player.position.y
  };
}
// 初始設定
const mapSize = 64;
>>>>>>> f9f5766 (first commit)
export let player = {
  x: 0,  // 初始位置會在後面設置
  y: 0,
  speed: BASE_MOVEMENT_SPEED,
  direction: 'down',
  frame: 0,
  moving: false
};
<<<<<<< HEAD

// 地圖尺寸改為使用單一地圖的尺寸
const mapSize = 64;
=======
>>>>>>> f9f5766 (first commit)
export let mapWidth = mapSize * tileSize;
export let mapHeight = mapSize * tileSize;
export let trees = [];
export let path = [];
export let keyMoveQueue = [];
export let moveProgress = 0;
export let logMessages = [];

// 初始化遊戲邏輯
export function setupGame() {
  // 設置玩家初始位置為中心
  const center = Math.floor(mapSize/2);
  player.x = (center + 0.5) * tileSize;
  player.y = (center + 0.5) * tileSize;
  
  trees = [];
  path = [];
  keyMoveQueue = [];
  moveProgress = 0;
  
  log("遊戲邏輯初始化完成", "system");
}

// 使用基於速度和時間的移動更新
export function updatePlayer(scene, delta, objectLayer) { // delta 是 Phaser update 循環傳遞的時間差 (毫秒)
  if (!delta || delta <= 0) return; // 防止 delta 無效或為 0

  let target = null;
  let isAutoNav = false;

  if (path.length > 0) {
    target = path[0]; // 自動導航目標
    isAutoNav = true;
    // 進一步簡化移動日誌，只在第一個路徑點時輸出
    if (path.length === 1) {
      log(`使用路徑中的目標位置: (${Math.round(target.x)}, ${Math.round(target.y)}) 網格: (${Math.round(target.x/tileSize)}, ${Math.round(target.y/tileSize)})`, 'debug');
    }
  } else if (keyMoveQueue.length > 1) { // 鍵盤移動需要起點和終點
    target = keyMoveQueue[1]; // 鍵盤移動目標
    // 進一步簡化移動日誌，只在第一個移動目標時輸出
    if (keyMoveQueue.length === 2) {
      log(`使用鍵盤移動目標位置: (${Math.round(target.x)}, ${Math.round(target.y)}) 網格: (${Math.round(target.x/tileSize)}, ${Math.round(target.y/tileSize)})`, 'debug');
    }
  }

  if (target) {
    if (!player.moving) { // 僅在開始移動時設置為 true
       player.moving = true;
    }
    const targetX = target.x;
    const targetY = target.y;
    const distance = Phaser.Math.Distance.Between(player.x, player.y, targetX, targetY);
    const moveAmount = player.speed * (delta / 1000); // 每幀移動的距離
    // 直接使用目標位置進行碰撞檢測，檢查玩家左側是否會與障礙物重疊
    const checkLeftX = targetX - (tileSize / 2);
    const checkY = targetY;
    if (isCollision(checkLeftX, checkY, objectLayer)) {
      log(`無法前進，左側碰撞於 (${Math.round(checkLeftX/tileSize)}, ${Math.round(checkY/tileSize)})`, 'warning');
      log(`玩家位置: (${Math.round(player.x)}, ${Math.round(player.y)}) 網格: (${Math.round(player.x/tileSize)}, ${Math.round(player.y/tileSize)})`, 'debug');
      log(`目標位置: (${Math.round(targetX)}, ${Math.round(targetY)}) 網格: (${Math.round(targetX/tileSize)}, ${Math.round(targetY/tileSize)})`, 'debug');
      path.length = 0;
      keyMoveQueue.length = 0;
      player.moving = false;
      return;
    } else if (isCollision(targetX, targetY, objectLayer)) {
      if (!isAutoNav) { // 僅在鍵盤移動時顯示碰撞日誌
        // 根據玩家與目標位置的相對位置確定障礙物方向
        let direction = '';
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        if (Math.abs(dy) >= tileSize / 2) {
          if (dy > 0) {
            direction = '下方';
          } else {
            direction = '上方';
          }
        } else if (Math.abs(dx) >= tileSize / 2) {
          if (dx > 0) {
            direction = '右側';
          } else {
            direction = '左側';
          }
        } else {
          direction = '未知方向';
        }
        log(`無法前進，${direction}碰撞於 (${Math.round(targetX/tileSize)}, ${Math.round(targetY/tileSize)})`, 'warning');
      }
      // 簡化日誌輸出，只顯示關鍵訊息
      path.length = 0;
      keyMoveQueue.length = 0;
      player.moving = false;
      return;
    }
    // 即使無碰撞，也檢查路徑是否有效，防止穿牆
    if (isAutoNav && path.length === 1 && distance > tileSize * 2) {
      log(`路徑無效，距離過遠 (${Math.round(distance)})，可能導致穿牆，取消導航`, 'warning');
      path.length = 0;
      player.moving = false;
      return;
    }
    if (distance <= moveAmount) {
      // 到達目標點
      player.x = targetX;
      player.y = targetY;
      moveProgress = 0;
      if (isAutoNav) {
        path.shift();
        if (path.length === 0) {
          log('導航完成', 'nav');
          player.moving = false;
        } else {
          // 只有在到達路徑點時才更新方向
          if (path.length > 0) {
            updateDirection({x: player.x, y: player.y}, path[0]);
          }
        }
      } else {
        keyMoveQueue.shift();
        keyMoveQueue.shift();
        // 簡化移動日誌，只在特定情況下輸出
        if (keyMoveQueue.length === 0) {
          log(`鍵盤移動完成：新位置 (${Math.round(player.x)}, ${Math.round(player.y)})`, 'move');
        }
        player.moving = false;
      }
    } else {
      // 向目標移動
      const angle = Phaser.Math.Angle.Between(player.x, player.y, targetX, targetY);
      player.x += Math.cos(angle) * moveAmount;
      player.y += Math.sin(angle) * moveAmount;
      // 在移動過程中持續更新方向，確保方向動畫正確顯示
      if (path.length > 0) {
        updateDirection({x: player.x, y: player.y}, path[0]);
      }
    }
  } else {
    if (player.moving) {
       log('主角停止移動', 'info');
       player.moving = false;
    }
  }
  if (player.moving) {
    player.frame = (player.frame + 0.1 * (delta / 16.66)) % 4;
  } else {
    player.frame = 0;
  }

  // 安全處理導航點消除邏輯
  if (Array.isArray(window?._navDots) && path.length > 0) {
    for (let i = window._navDots.length - 1; i >= 0; i--) {
      const dot = window._navDots[i];
      const target = path[i] || {};
      if (dot && target) {
        const dx = Math.abs(player.x - target.x);
        const dy = Math.abs(player.y - target.y);
        if (dx < tileSize/3 && dy < tileSize/3) {
          dot.destroy();
          window._navDots.splice(i, 1);
          path.splice(i, 1);
          break; // 只消除一個，避免多點同時消失
        }
      }
    }
  }
}


function updateDirection(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    // 水平移動為主
    if (dx > 0) player.direction = 'right';
    else if (dx < 0) player.direction = 'left';
  } else {
    // 垂直移動為主
    if (dy > 0) player.direction = 'down';
    else if (dy < 0) player.direction = 'up';
  }
}

// 檢查指定位置是否有碰撞
export function isCollision(x, y, objectLayer) {
  if (!objectLayer || objectLayer.length === 0) return false;
  
  const gridX = Math.floor(x / tileSize);
  const gridY = Math.floor(y / tileSize);
  
  // 檢查網格坐標是否在有效範圍內
  if (gridY < 0 || gridY >= objectLayer.length ||
      gridX < 0 || gridX >= objectLayer[0].length) {
    return true; // 超出邊界視為碰撞
  }
  
  // 0=可通行，非0=障礙物
  return objectLayer[gridY][gridX] !== 0;
}

export function log(message, type = 'info') {
  const logDiv = document.getElementById('log');
  const timestamp = new Date().toLocaleTimeString();
  const lastLogEntry = logMessages[logMessages.length - 1];
  const now = Date.now();

  // Special consolidation for "鍵盤移動完成：" messages
  if (type === 'move' && message.startsWith('鍵盤移動完成：') &&
      lastLogEntry && lastLogEntry.type === 'move' &&
      lastLogEntry.message.startsWith('鍵盤移動完成：') &&
      now - lastLogEntry.timestamp < 750) { // Short timeout for continuous movement logs

    lastLogEntry.message = message; // Update to the latest position message
    lastLogEntry.count = (lastLogEntry.count || 1) + 1;
    lastLogEntry.timestamp = now;

    if (logDiv) {
      const logEntries = logDiv.getElementsByClassName('log-entry');
      if (logEntries.length > 0) {
        const lastEntryElement = logEntries[logEntries.length - 1];
        lastEntryElement.innerHTML = `[${timestamp}] [${type.toUpperCase()}] ${message} (x${lastLogEntry.count})`;
      }
    }
  }
  // Generic consolidation for other identical messages
  else if (lastLogEntry &&
           lastLogEntry.message === message &&
           lastLogEntry.type === type &&
           now - lastLogEntry.timestamp < 2000) {

    lastLogEntry.count = (lastLogEntry.count || 1) + 1;
    lastLogEntry.timestamp = now;

    if (logDiv) {
      const logEntries = logDiv.getElementsByClassName('log-entry');
      if (logEntries.length > 0) {
        const lastEntryElement = logEntries[logEntries.length - 1];
        lastEntryElement.innerHTML = `[${timestamp}] [${type.toUpperCase()}] ${message} (x${lastLogEntry.count})`;
      }
    }
  }
  // New, distinct message
  else {
    const newEntry = {
      message,
      type,
      timestamp: now,
      count: 1
    };
    logMessages.push(newEntry);

    if (logMessages.length > 100) {
      logMessages.shift();
    }
    

    if (logDiv) {
      const entryElement = document.createElement('div');
      entryElement.className = `log-entry log-${type.toLowerCase()}`;
      entryElement.innerHTML = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
      logDiv.appendChild(entryElement);
      logDiv.scrollTop = logDiv.scrollHeight;
    }
  }

  // In-console logging (for development debugging)
  console.log(`[${type.toUpperCase()}] ${timestamp}: ${message}`);
}

/**
 * A* 尋路算法
 * @param {Object} start - 起點 {x, y}
 * @param {Object} end - 終點 {x, y}
 * @param {Array<Array<number>>} grid - 二維網格陣列
 * @returns {Array<{x: number, y: number}>} 路徑點陣列
 */
export function aStar(start, end, grid) {
  // 將像素坐標轉換為網格坐標
  const gridStart = {
    x: Math.floor(start.x / tileSize),
    y: Math.floor(start.y / tileSize)
  };
  const gridEnd = {
    x: Math.floor(end.x / tileSize),
    y: Math.floor(end.y / tileSize)
  };

  // 檢查網格範圍
  if (!grid || grid.length === 0 ||
      gridStart.x < 0 || gridStart.x >= grid[0].length ||
      gridStart.y < 0 || gridStart.y >= grid.length ||
      gridEnd.x < 0 || gridEnd.x >= grid[0].length ||
      gridEnd.y < 0 || gridEnd.y >= grid.length) {
    return [];
  }

  // 定義節點類
  class Node {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.g = 0; // 從起點到當前節點的實際代價
      this.h = 0; // 從當前節點到終點的啟發式估計代價
      this.f = 0; // f = g + h
      this.parent = null;
    }
  }

  // 創建開放列表和關閉列表
  const openList = [];
  const closedList = [];

  // 將起點加入開放列表
  const startNode = new Node(gridStart.x, gridStart.y);
  openList.push(startNode);

  // 四個方向的偏移量
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 1, y: 0 },  // 右
    { x: 0, y: 1 },  // 下
    { x: -1, y: 0 }  // 左
  ];

  while (openList.length > 0) {
    // 在開放列表中找到 f 值最小的節點
    let currentNode = openList[0];
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < currentNode.f) {
        currentNode = openList[i];
        currentIndex = i;
      }
    }

    // 將當前節點從開放列表移到關閉列表
    openList.splice(currentIndex, 1);
    closedList.push(currentNode);

    // 如果當前節點是終點，則回溯路徑
    if (currentNode.x === gridEnd.x && currentNode.y === gridEnd.y) {
      const path = [];
      let current = currentNode;
      while (current !== null) {
        // 將網格坐標轉回像素坐標
        path.push({
          x: current.x * tileSize + tileSize / 2,
          y: current.y * tileSize + tileSize / 2
        });
        current = current.parent;
      }
      return path.reverse(); // 反轉路徑，從起點到終點
    }

    // 檢查鄰居
    for (const dir of directions) {
      const neighborX = currentNode.x + dir.x;
      const neighborY = currentNode.y + dir.y;

      // 檢查鄰居是否在網格範圍內
      if (neighborX < 0 || neighborX >= grid[0].length ||
          neighborY < 0 || neighborY >= grid.length) {
        continue;
      }

      // 檢查鄰居是否為障礙物 (0=可通行, 非0=障礙)
      if (grid[neighborY][neighborX] !== 0) {
        continue;
      }

      // 檢查鄰居是否在關閉列表中
      let inClosed = false;
      for (const closedNode of closedList) {
        if (closedNode.x === neighborX && closedNode.y === neighborY) {
          inClosed = true;
          break;
        }
      }
      if (inClosed) {
        continue;
      }

      // 創建鄰居節點
      const neighborNode = new Node(neighborX, neighborY);
      neighborNode.g = currentNode.g + 1; // 假設每一步代價為1
      neighborNode.h = Math.abs(neighborX - gridEnd.x) + Math.abs(neighborY - gridEnd.y); // 曼哈頓距離
      neighborNode.f = neighborNode.g + neighborNode.h;
      neighborNode.parent = currentNode;

      // 檢查鄰居是否在開放列表中，且是否已有更小的g值
      let inOpen = false;
      for (const openNode of openList) {
        if (openNode.x === neighborX && openNode.y === neighborY) {
          inOpen = true;
          if (neighborNode.g < openNode.g) {
            openNode.g = neighborNode.g;
            openNode.f = openNode.g + openNode.h;
            openNode.parent = currentNode;
          }
          break;
        }
      }

      // 如果不在開放列表中，則加入
      if (!inOpen) {
        openList.push(neighborNode);
      }
    }
  }

  // 開放列表為空，沒有找到路徑
  return [];
<<<<<<< HEAD
=======
  // 新增座標校準
  player.x = Math.round(player.x * GRID_SIZE) / GRID_SIZE;
  player.y = Math.round(player.y * GRID_SIZE) / GRID_SIZE;
>>>>>>> f9f5766 (first commit)
}

