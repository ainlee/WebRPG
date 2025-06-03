// 開發者工具最小化/展開功能
document.addEventListener('DOMContentLoaded', function () {
  if (!window.SHOW_DEV_TOOLS) {
    const devTools = document.getElementById('dev-tools');
    if (devTools) devTools.style.display = 'none';
    return;
  }
  const devTools = document.getElementById('dev-tools');
  const minimizeBtn = document.getElementById('minimize-dev-tools');
  if (devTools && minimizeBtn) {
    // 預設為摺疊狀態
    devTools.classList.remove('expanded');
    devTools.classList.add('minimized');
    minimizeBtn.textContent = '+';
    const content = devTools.querySelector('.dev-content');
    if (content) {
      content.style.display = 'none';
    }
    minimizeBtn.addEventListener('click', function () {
      devTools.classList.toggle('minimized');
      const isMin = devTools.classList.contains('minimized');
      minimizeBtn.textContent = isMin ? '+' : '-';
      if (content) content.style.display = isMin ? 'none' : 'block';
    });
  }
});

// 為開發者工具添加拖移功能
const devTools = document.getElementById('dev-tools');
const devTitle = document.querySelector('.dev-title');

let offsetX = 0;
let offsetY = 0;
let isDragging = false;

// 確保 JavaScript 不動態修改 .dev-title 的高度
if (devTitle) {
  devTitle.style.height = '32px'; // 確保高度固定
  devTitle.style.padding = '0'; // 移除內邊距
  devTitle.style.margin = '0'; // 秮除外邊距
}

// 修正拖移功能，清理多餘邏輯，確保拖移正常運作
if (devTitle) {
  devTitle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - devTools.offsetLeft;
    offsetY = e.clientY - devTools.offsetTop;
    devTools.style.transition = 'none'; // 禁用過渡效果
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      devTools.style.left = `${Math.max(0, Math.min(newX, window.innerWidth - devTools.offsetWidth))}px`;
      devTools.style.top = `${Math.max(0, Math.min(newY, window.innerHeight - devTools.offsetHeight))}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;

      // 確保開發者工具在畫面內
      const rect = devTools.getBoundingClientRect();
      const clampedLeft = Math.max(0, Math.min(rect.left, window.innerWidth - rect.width));
      const clampedTop = Math.max(0, Math.min(rect.top, window.innerHeight - rect.height));
      devTools.style.left = `${clampedLeft}px`;
      devTools.style.top = `${clampedTop}px`;
    }
  });
}