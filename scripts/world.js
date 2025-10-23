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
    difficulty: Math.min(Math.abs(mapX) + Math.abs(mapY), 10), // 根據距離計算難度
    isSpecial: ((Math.abs(mapX) + Math.abs(mapY)) % 5) === 0 // 每隔5個地圖有特殊房間
  };
}