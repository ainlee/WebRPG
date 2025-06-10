// 地圖生成與世界相關邏輯
import Random from './random.js';

export function generateMapLayers(mapData) {
  const { seed, difficulty = 1, verticalConnectivity = false, horizontalConnectivity = false, type = 'random' } = mapData;
  const mazeType = type;
  const size = 64;
  const rng = new Random(seed);

  // 地板層永遠是草地
  const ground = Array(size).fill().map(() => Array(size).fill(1));
  
  // 生成物件層
  const objectLayer = Array(size).fill().map(() => Array(size).fill(0));

  // 確保玩家初始位置為開放式空間
  const center = Math.floor(size / 2);
  const safetyZone = 3; // 調整為 3x3 的安全區域，減少淨空範圍
  for (let y = center - safetyZone; y <= center + safetyZone; y++) {
    for (let x = center - safetyZone; x <= center + safetyZone; x++) {
      objectLayer[y][x] = 0; // 確保中心區域無障礙物
    }
  }

  // 根據迷宮類型生成地圖
  console.log("生成地圖類型: " + mazeType);
  if (mazeType === 'tunnel') {
    generateTunnelMap(ground, objectLayer, rng, difficulty);
    console.log("調用了 generateTunnelMap");
  } else if (mazeType === 'room') {
    generateSpecialRoom(objectLayer, rng, difficulty);
    console.log("調用了 generateSpecialRoom");
  } else if (mazeType === 'random') {
    generateRandomMap(ground, objectLayer, rng, difficulty);
    console.log("調用了 generateRandomMap");
  } else if (mazeType === 'mixed') {
    // 隨機選擇兩種或三種迷宮類型混合
    const types = ['tunnel', 'room', 'random'];
    const selectedTypes = types.slice(0, 2); // 選擇前兩種進行混合
    selectedTypes.forEach(type => {
      if (type === 'tunnel') {
        generateTunnelMap(ground, objectLayer, rng, difficulty);
        console.log("混合模式: 調用了 generateTunnelMap");
      } else if (type === 'room') {
        generateSpecialRoom(objectLayer, rng, difficulty);
        console.log("混合模式: 調用了 generateSpecialRoom");
      } else if (type === 'random') {
        generateRandomMap(ground, objectLayer, rng, difficulty);
        console.log("混合模式: 調用了 generateRandomMap");
      }
    });
  } else {
    // 如果迷宮類型未識別，默認使用 random 類型
    console.log("未識別的迷宮類型，默認使用 random");
    generateRandomMap(ground, objectLayer, rng, difficulty);
  }

  console.log("生成過程完成，準備檢查地圖可達性前的障礙物數量計算");
  let preAccessibilityObstacleCount = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (objectLayer[y][x] === 2) {
        preAccessibilityObstacleCount++;
      }
    }
  }
  console.log("檢查地圖可達性前的障礙物數量: " + preAccessibilityObstacleCount);
  
  // 檢查地圖可達性
  ensureAccessibility(objectLayer);
  
  // 檢查障礙物數量
  let obstacleCount = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (objectLayer[y][x] === 2) {
        obstacleCount++;
      }
    }
  }
  console.log("最終障礙物數量（可達性檢查後）: " + obstacleCount);
  console.log("最終障礙物數量確認：應與移除後障礙物總數一致，如果不一致則有問題");

  return { ground, objectLayer };
}

// 生成通道型迷宮
function generateTunnelMap(ground, objectLayer, rng, difficulty) {
  const size = objectLayer.length;
  const targetObstacleCount = 1600; // 目標障礙物數量，約佔 64x64 地圖的 39%
  let obstacleCount = 0;
  const center = Math.floor(size / 2);
  const safetyZone = 3; // 玩家初始位置周圍的安全區域，調整為 3x3

  // 先嘗試以較高機率生成障礙物
  const obstacleChance = 0.6; // 進一步提高機率以確保足夠的障礙物
  console.log("開始生成通道型迷宮，目標障礙物數量: " + targetObstacleCount);
  console.log("障礙物生成機率: " + obstacleChance);

  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      // 確保玩家初始位置周圍的安全區域無障礙物
      if (Math.abs(x - center) <= safetyZone && Math.abs(y - center) <= safetyZone) {
        continue;
      }
      const randomValue = rng.next();
      if (randomValue < obstacleChance && obstacleCount < targetObstacleCount) {
        objectLayer[y][x] = 2; // 石頭/障礙物
        obstacleCount++;
        if (obstacleCount % 100 === 0) {
          console.log("通道型迷宮生成中，當前障礙物數量: " + obstacleCount + "，隨機值: " + randomValue);
        }
      }
    }
  }
  console.log("通道型迷宮第一階段生成障礙物數量: " + obstacleCount);

  // 如果障礙物數量不足，繼續生成直到達到目標
  let attempts = 0;
  while (obstacleCount < targetObstacleCount) {
    const x = rng.nextInt(1, size - 2);
    const y = rng.nextInt(1, size - 2);
    if (Math.abs(x - center) > safetyZone || Math.abs(y - center) > safetyZone) {
      if (objectLayer[y][x] !== 2) {
        objectLayer[y][x] = 2;
        obstacleCount++;
      }
    }
    attempts++;
    if (attempts > 10000) {
      console.log("通道型迷宮生成障礙物嘗試次數過多，中斷循環，當前數量: " + obstacleCount);
      break;
    }
  }
  console.log("通道型迷宮最終生成障礙物數量: " + obstacleCount);
}

// 生成小房間型迷宮
function generateSpecialRoom(objectLayer, rng, difficulty) {
  const size = objectLayer.length;
  const center = Math.floor(size / 2);
  const roomSize = Math.min(15 + difficulty, 25);
  const start = center - Math.floor(roomSize / 2);
  const end = center + Math.floor(roomSize / 2);
  const targetObstacleCount = 1600; // 目標障礙物數量，約佔 64x64 地圖的 39%
  let obstacleCount = 0;
  const safetyZone = 3; // 玩家初始位置周圍的安全區域，調整為 3x3

  // 先填充整個地圖為牆
  console.log("開始生成特殊房間迷宮，目標障礙物數量: " + targetObstacleCount);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      objectLayer[y][x] = 2;
      obstacleCount++;
    }
  }

  // 清空中央房間
  for (let y = start; y <= end; y++) {
    for (let x = start; x <= end; x++) {
      if (y >= 0 && y < size && x >= 0 && x < size) {
        objectLayer[y][x] = 0;
        obstacleCount--;
      }
    }
  }

  // 確保玩家初始位置周圍的安全區域無障礙物
  for (let y = center - safetyZone; y <= center + safetyZone; y++) {
    for (let x = center - safetyZone; x <= center + safetyZone; x++) {
      if (y >= 0 && y < size && x >= 0 && x < size) {
        if (objectLayer[y][x] === 2) {
          objectLayer[y][x] = 0;
          obstacleCount--;
        }
      }
    }
  }
  console.log("特殊房間迷宮第一階段生成障礙物數量: " + obstacleCount);

  // 如果障礙物數量不足，繼續生成直到達到目標
  let attempts = 0;
  while (obstacleCount < targetObstacleCount) {
    const x = rng.nextInt(1, size - 2);
    const y = rng.nextInt(1, size - 2);
    if (Math.abs(x - center) > safetyZone || Math.abs(y - center) > safetyZone) {
      if (objectLayer[y][x] !== 2) {
        objectLayer[y][x] = 2;
        obstacleCount++;
      }
    }
    attempts++;
    if (attempts > 10000) {
      console.log("特殊房間迷宮生成障礙物嘗試次數過多，中斷循環，當前數量: " + obstacleCount);
      break;
    }
  }
  console.log("特殊房間迷宮最終生成障礙物數量: " + obstacleCount);
}

// 生成隨機分佈型迷宮
function generateRandomMap(ground, objectLayer, rng, difficulty) {
  const size = objectLayer.length;
  const targetObstacleCount = 1600; // 目標障礙物數量，約佔 64x64 地圖的 39%
  let obstacleCount = 0;
  const center = Math.floor(size / 2);
  const safetyZone = 3; // 玩家初始位置周圍的安全區域，調整為 3x3

  // 先嘗試以較高機率生成障礙物
  const obstacleChance = 0.4; // 降低機率以減少障礙物密度，增加可通行通道
  console.log("開始生成隨機分佈型迷宮，目標障礙物數量: " + targetObstacleCount);
  console.log("障礙物生成機率: " + obstacleChance);

  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      // 確保玩家初始位置周圍的安全區域無障礙物
      if (Math.abs(x - center) <= safetyZone && Math.abs(y - center) <= safetyZone) {
        continue;
      }
      const randomValue = rng.next();
      if (randomValue < obstacleChance && obstacleCount < targetObstacleCount) {
        objectLayer[y][x] = 2; // 石頭/障礙物
        obstacleCount++;
        if (obstacleCount % 100 === 0) {
          console.log("隨機分佈型迷宮生成中，當前障礙物數量: " + obstacleCount + "，隨機值: " + randomValue);
        }
      }
    }
  }
  console.log("隨機分佈型迷宮第一階段生成障礙物數量: " + obstacleCount);

  // 如果障礙物數量不足，繼續生成直到達到目標
  let attempts = 0;
  while (obstacleCount < targetObstacleCount) {
    const x = rng.nextInt(1, size - 2);
    const y = rng.nextInt(1, size - 2);
    if (Math.abs(x - center) > safetyZone || Math.abs(y - center) > safetyZone) {
      if (objectLayer[y][x] !== 2) {
        objectLayer[y][x] = 2;
        obstacleCount++;
      }
    }
    attempts++;
    if (attempts > 10000) {
      console.log("隨機分佈型迷宮生成障礙物嘗試次數過多，中斷循環，當前數量: " + obstacleCount);
      break;
    }
  }
  console.log("隨機分佈型迷宮最終生成障礙物數量: " + obstacleCount);
}

// 檢查地圖可達性
function ensureAccessibility(map) {
  const size = map.length;
  const center = Math.floor(size / 2);
  
  // 使用洪水填充算法檢查可達性
  const visited = Array(size).fill().map(() => Array(size).fill(false));
  const queue = [[center, center]];
  visited[center][center] = true;
  let accessibleCount = 1;
  
  console.log("開始檢查地圖可達性，從中心點 (" + center + "," + center + ") 開始");
  
  while (queue.length > 0) {
    const [y, x] = queue.shift();
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    for (const [dy, dx] of directions) {
      const ny = y + dy;
      const nx = x + dx;
      
      if (ny >= 0 && ny < size && nx >= 0 && nx < size &&
          !visited[ny][nx] && map[ny][nx] !== 2) {
        visited[ny][nx] = true;
        queue.push([ny, nx]);
        accessibleCount++;
        if (accessibleCount % 100 === 0) {
          console.log("可達性檢查中，可達點數量: " + accessibleCount);
        }
      }
    }
  }
  
  console.log("可達性檢查完成，總共可達點數量: " + accessibleCount);
  
  // 調整策略：優先保留靠近中心點的不可達障礙物，確保玩家可見範圍內有障礙物
  let removedObstacles = 0;
  let keptObstaclesCount = 0;
  const targetKeepCount = 800; // 目標保留 800 個障礙物，減少密度以增加可通行通道
  const centerPriorityRadius = 20; // 優先保留中心點附近 20 個單位的障礙物
  const keptPositions = new Set();
  console.log("開始移除不可達障礙物，目標保留數量: " + targetKeepCount + "，優先中心半徑: " + centerPriorityRadius);
  
  // 首先保留靠近中心點的不可達障礙物
  for (let y = 0; y < size && keptObstaclesCount < targetKeepCount; y++) {
    for (let x = 0; x < size && keptObstaclesCount < targetKeepCount; x++) {
      if (!visited[y][x] && map[y][x] === 2) {
        const distanceToCenter = Math.sqrt(Math.pow(y - center, 2) + Math.pow(x - center, 2));
        if (distanceToCenter <= centerPriorityRadius) {
          keptPositions.add(`${y},${x}`);
          keptObstaclesCount++;
          if (keptObstaclesCount % 100 === 0) {
            console.log("優先保留靠近中心的障礙物數量: " + keptObstaclesCount + "，當前位置: (" + x + "," + y + ")，距離中心: " + distanceToCenter);
          }
        }
      }
    }
  }
  
  // 如果未達到目標保留數量，繼續保留其他不可達障礙物
  for (let y = 0; y < size && keptObstaclesCount < targetKeepCount; y++) {
    for (let x = 0; x < size && keptObstaclesCount < targetKeepCount; x++) {
      if (!visited[y][x] && map[y][x] === 2 && !keptPositions.has(`${y},${x}`)) {
        const distanceToCenter = Math.sqrt(Math.pow(y - center, 2) + Math.pow(x - center, 2));
        if (distanceToCenter > centerPriorityRadius) {
          keptPositions.add(`${y},${x}`);
          keptObstaclesCount++;
          if (keptObstaclesCount % 100 === 0 && keptObstaclesCount > targetKeepCount * 0.5) {
            console.log("保留其他不可達障礙物數量: " + keptObstaclesCount + "，當前位置: (" + x + "," + y + ")，距離中心: " + distanceToCenter);
          }
        }
      }
    }
  }
  
  // 移除未保留的不可達障礙物
  let actualRemovedObstacles = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!visited[y][x] && map[y][x] === 2 && !keptPositions.has(`${y},${x}`)) {
        map[y][x] = 0; // 移除未保留的不可達障礙物
        actualRemovedObstacles++;
        if (actualRemovedObstacles % 100 === 0) {
          console.log("實際移除不可達障礙物數量: " + actualRemovedObstacles);
        }
      }
    }
  }
  console.log("可達性檢查後，實際移除的障礙物總數: " + actualRemovedObstacles);
  console.log("可達性檢查後，預期保留的障礙物總數: " + keptObstaclesCount);
  
  console.log("移除後障礙物總數檢查：再次計算以確認");
  let postRemoveObstacleCount = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (map[y][x] === 2) {
        postRemoveObstacleCount++;
      }
    }
  }
  console.log("移除後障礙物總數: " + postRemoveObstacleCount);
}

import Phaser from 'phaser';

// 確保Phaser全域變數可用
if (typeof window !== 'undefined') {
  window.Phaser = Phaser;
}

// 場景顯示模式狀態管理
let viewMode = '2.5D';  // '2D' 或 '2.5D'
const viewModeSettings = {
  '2D': {
    projectionMatrix: new Phaser.Math.Matrix4().identity(),
    cameraZoom: 1.5,
    depthTest: false
  },
  '2.5D': {
    projectionMatrix: new Phaser.Math.Matrix4()
      .identity()
      .rotateX(Math.PI/4)
      .rotateZ(Math.PI/4)
      .scale(1, 0.5, 1),
    cameraZoom: 1.0,
    depthTest: true,
    layerScale: 0.8,     // 層級縮放係數
    shadowIntensity: 0.3 // 陰影強度
  }
};

export function toggleViewMode(scene) {
  viewMode = viewMode === '2D' ? '2.5D' : '2D';
  updateViewMode(scene);
  return viewMode;
}

function updateViewMode(scene) {
  const settings = viewModeSettings[viewMode];
  
  scene.cameras.main.setProjectionMatrix(settings.projectionMatrix);
  scene.cameras.main.setZoom(settings.cameraZoom);
  
  const gl = scene.game.renderer.gl;
  if (settings.depthTest) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  } else {
    gl.disable(gl.DEPTH_TEST);
  }
}


// 初始化等角投影系統
export function initIsometric(scene) {
  updateViewMode(scene);
  // 確保Phaser已正確加載
  if (!Phaser || !Phaser.Plugins) {
    throw new Error('Phaser尚未正確初始化');
  }
  
  // 啟用WebGL混合模式
  const gl = scene.game.renderer.gl;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

// 等角投影轉換函式
function calculateScreenPosition(obj) {
  return scene.cameras.main.getWorldPoint(
    obj.x, obj.y, obj.z || 0
  );
}

// 新版場景渲染函式
// 漸層背景系統
function createGradientBackground(scene) {
  const gradient = scene.textures.createCanvas('gradient', 800, 600);
  const ctx = gradient.getContext();
  const grd = ctx.createLinearGradient(0, 0, 0, 600);
  grd.addColorStop(0, '#87CEEB'); // 天空藍
  grd.addColorStop(1, '#228B22'); // 森林綠
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 800, 600);
  gradient.refresh();
  return scene.add.sprite(400, 300, 'gradient').setDepth(-1000);
}

// 動態陰影系統
function createObjectShadow(scene, obj) {
  const shadow = scene.add.isoSprite(
    obj.x + 8,
    obj.y + 8,
    0,
    'shadow'
  )
  .setAlpha(viewModeSettings[viewMode].shadowIntensity)
  .setDepth(obj.depth - 1)
  .setScale(1.2, 1.2)
  .setTint(0x000000);
  shadow.originalY = obj.y;
  return shadow;
}

// 圖層管理系統
const sceneLayers = {
  background: [],
  terrain: [],
  objects: [],
  characters: [],
  effects: []
};

export function drawScene(scene, gameObjects) {
  // 繪製漸層背景
  if (!scene.background) {
    scene.background = createGradientBackground(scene);
  }
  // 根據相機投影矩陣自動計算深度值
  gameObjects.forEach(obj => {
    const clipPos = scene.cameras.main.getClipPosition(obj);
    obj.setDepth(clipPos[2]); // 使用Z軸投影值作為深度
  });

  // 分層渲染
  Object.values(sceneLayers).forEach(layer => {
    layer.forEach(obj => obj.destroy());
  });
  sceneLayers.background = [scene.background];
  
  // 使用物件池優化精靈重用
  const spritePool = scene.isoSpritePool || (scene.isoSpritePool = []);
  
  // 按深度值排序後更新精靈狀態
  gameObjects.sort((a, b) => a.depth - b.depth)
    .forEach((obj, index) => {
      let sprite = spritePool[index];
    const screenPos = isoTransform.call(scene, obj);
    
    if (!sprite) {
      sprite = scene.add.isoSprite(0, 0, 0, obj.texture)
        .setVisible(false);
      spritePool.push(sprite);
    }

    sprite
      .setPosition(obj.x, obj.y, obj.z || 0)
      .setScale(obj.scaleX || 1, obj.scaleY || 1)
      .setDepth(screenPos.y)
      .setTexture(obj.texture)
      .setVisible(true);

    // 添加陰影效果
    if (obj.castShadow) {
      const shadow = scene.add.isoSprite(
        obj.x + 8,
        obj.y + 8,
        0,
        'shadow'
      ).setAlpha(0.3).setDepth(screenPos.y - 1);
      spritePool.push(shadow);
    }
  });

  // 隱藏未使用的精靈
  for (let i = sortedObjects.length; i < spritePool.length; i++) {
    spritePool[i].setVisible(false);
  }
}

// 取得玩家初始位置（保持在中心點）
export function getPlayerStartPos(tileSize, mapSize) {
  const center = Math.floor(mapSize / 2);
  return {
    x: (center + 0.5) * tileSize,
    y: (center + 0.5) * tileSize
  };
}

// 使用座標和種子生成唯一的地圖種子
export function calculateMapData(mapX, mapY, seed) {
  const mapSeed = seed + mapX * 10000 + mapY;
  return {
    seed: mapSeed,
    difficulty: Math.min(Math.abs(mapX) + Math.abs(mapY), 10),
    isSpecial: ((Math.abs(mapX) + Math.abs(mapY)) % 5) === 0
  };
}