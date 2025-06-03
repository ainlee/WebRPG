export function saveGame(state) {
  localStorage.setItem('gameState', JSON.stringify(state));
  console.log('遊戲已存檔');
}

export function loadGame() {
  const state = localStorage.getItem('gameState');
  console.log('遊戲已讀檔');
  return state ? JSON.parse(state) : null;
}