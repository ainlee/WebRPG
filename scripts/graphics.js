import { tileSize } from './gameLogic.js';
import { colors } from './assets.js';

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

  emit(pathNodes) {
    for (const node of pathNodes) {
      if (this.particles.length < this.maxParticles) {
        const p = this.pool.pop() || new PathParticle(0,0);
        p.position.x = node.x * tileSize + tileSize/2;
        p.position.y = node.y * tileSize + tileSize/2;
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
    this.particles.forEach(p => {
      const alpha = p.life * 0.8;
      graphics.beginPath();
      graphics.arc(p.position.x, p.position.y, 2, 0, Math.PI * 2);
      graphics.fillStyle(`rgba(255, 100, 100, ${alpha})`);
      graphics.fill();
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