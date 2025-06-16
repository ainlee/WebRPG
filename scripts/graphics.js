import { tileSize } from './gameLogic.js';
import { colors } from './assets.js';
import { CoordinateSystem } from './core/CoordinateSystem.js';
import { PerspectiveManager } from './perspective.js';

export function drawSprite(graphics, sprite) {
  graphics.clear();
  let pixelSize = tileSize / sprite[0].length;
  for (let i = 0; i < sprite.length; i++) {
    for (let j = 0; j < sprite[i].length; j++) {
      if (sprite[i][j] !== 0) {
        graphics.fillStyle(colors[sprite[i][j]].replace('#', '0x'));
        graphics.fillRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

/**
 * 路徑粒子類別，管理單一粒子狀態
 * @class
 */
class PathParticle {
  constructor(x, y) {
    this.position = { x, y };
    this.velocity = { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 };
    this.life = 1.0;
    this.decay = 0.02 + Math.random() * 0.03;
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.life -= this.decay;
    return this.life > 0;
  }
}

export class PathParticleSystem {
  constructor(maxParticles = 500) {
    this.particles = [];
    this.maxParticles = maxParticles;
    this.pool = new Array(maxParticles).fill().map(() => new PathParticle(0, 0));
  }

  emit(pathNodes, perspectiveManager) {
    const coordSystem = new CoordinateSystem({
      canvasWidth: 800,
      canvasHeight: 600,
      tileSize: tileSize
    });
    
    // 根據當前視角模式調整投影方式
    const projectionHandler = perspectiveManager.mode === '2D'
      ? coordSystem.project.bind(coordSystem)
      : coordSystem.projectWithScale.bind(coordSystem);

    for (const node of pathNodes) {
      if (this.particles.length < this.maxParticles) {
        const p = this.pool.pop() || new PathParticle(0, 0);
        
        // 核心座標計算
        const logicalPos = projectionHandler(node.x, node.y);
        p.position.x = logicalPos.x;
        p.position.y = logicalPos.y;

        // DOM相關操作
        if (typeof document !== 'undefined') {
          p.element = document.createElement('div');
          p.element.className = 'path-particle';
          const visualPos = coordSystem.projectWithScale(node.x, node.y);
          p.element.style.transform = `translate3d(${visualPos.x}px, ${visualPos.y}px, 0) scale(${visualPos.scale})`;
          p.element.style.transformStyle = 'preserve-3d';
          console.log('[DOM Transform] 套用3D轉換:', p.element.style.transform);
        }

        p.life = 1.0;
        this.particles.push(p);
      }
    }
  }

  update() {
    this.particles = this.particles.filter(p => {
      const alive = p.update();
      if (!alive) this.pool.push(p);
      return alive;
    });
  }

  draw(graphics) {
    graphics.lineStyle(0);
    
    // 繪製邊框標示圖層範圍
    graphics.lineStyle(2, 0x00ff00, 0.5);
    graphics.strokeRect(
      -graphics.width/2,
      -graphics.height/2,
      graphics.width,
      graphics.height
    );
    
    this.particles.forEach(p => {
      const alpha = p.life * 0.8;
      graphics.beginPath();
      graphics.arc(p.position.x, p.position.y, 2, 0, Math.PI * 2);
      graphics.fillStyle(`rgba(255, 100, 100, ${alpha})`);
      graphics.fill();
      
      // 輸出粒子深度資訊
      if(window.debugMode) {
        const depth = CoordinateSystem.current.calculateDepth(p.position);
        console.log(`[DepthSort] 粒子位置: (${p.position.x.toFixed(1)}, ${p.position.y.toFixed(1)}) 深度值: ${depth.toFixed(3)}`);
      }
    });
  }
}

export function drawPath(graphics, path, useParticles = true) {
  graphics.clear();
  if (path.length === 0) return;
  
  if (useParticles) {
    const ps = new PathParticleSystem();
    ps.emit(path);
    ps.draw(graphics);
  } else {
    graphics.lineStyle(2, 0xff0000);
    graphics.beginPath();
    for (let node of path) {
      graphics.lineTo(node.x * tileSize + tileSize / 2, node.y * tileSize + tileSize / 2);
    }
    graphics.strokePath();
  }
}

export function drawStatusUI(textObj, player) {
  const status = [
    `位置: (${Math.round(player.x)}, ${Math.round(player.y)})`,
    `方向: ${player.direction}`,
    `移動中: ${player.moving ? '是' : '否'}`,
    `動畫框架: ${Math.floor(player.frame)}`
  ];
  textObj.setText(status.join('\n'));
}

export function drawLogWindow(textObj, logMessages) {
  const maxLogs = 10; // 顯示最近 10 條日誌
  const recentLogs = logMessages.slice(-maxLogs);
  textObj.setText(recentLogs.join('\n'));
}
/**
 * 動態深度緩衝排序演算法
 * @param {Array} objects 需排序的3D物件陣列
 * @returns {Array} 按深度值降冪排序後的陣列
 */
function depthBufferSort(objects) {
  const sorted = objects.sort((a, b) => {
    const depthA = a.transform.position.z * (a.scale.z || 1);
    const depthB = b.transform.position.z * (b.scale.z || 1);
    
    // 深度排序日誌
    console.groupCollapsed(`深度排序比較 ${a.name} vs ${b.name}`);
    console.log(`物件A z: ${a.transform.position.z} 縮放: ${a.scale.z} 總深度: ${depthA}`);
    console.log(`物件B z: ${b.transform.position.z} 縮放: ${b.scale.z} 總深度: ${depthB}`);
    console.groupEnd();
    
    return depthB - depthA;
  });
  
  console.table(sorted.map(obj => ({
    名稱: obj.name,
    深度值: obj.transform.position.z * (obj.scale.z || 1),
    位置: `(${obj.transform.position.x.toFixed(1)}, ${obj.transform.position.y.toFixed(1)})`
  })));
  return sorted;
}

/**
 * 精靈圖投影計算函式
 * @param {Object} sprite 精靈圖物件
 * @param {Object} lightSource 光源參數
 * @returns {Object} 投影矩陣與陰影參數
 */
function calculateSpriteProjection(sprite, lightSource) {
  const { position, size } = sprite;
  const projectionMatrix = mat4.create();
  const shadowIntensity = Math.min(1, lightSource.intensity / 1000);
  
  mat4.ortho(projectionMatrix,
    position.x - size.width/2,
    position.x + size.width/2,
    position.y - size.height/2,
    position.y + size.height/2,
    0.1, 1000
  );

  return {
    projectionMatrix,
    shadowParams: {
      intensity: shadowIntensity,
      blurRadius: Math.sqrt(lightSource.intensity) * 0.1
    }
  };
}