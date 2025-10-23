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

export function drawPath(graphics, path) {
  graphics.clear();
  if (path.length > 0) {
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