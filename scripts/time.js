export function initializeTimeSystem(scene) {
  scene.timeOfDay = 0; // 初始化時間
}

export function updateTime(scene, delta) {
  scene.timeOfDay += delta;
  if (scene.timeOfDay >= 24) {
    scene.timeOfDay = 0; // 循環一天
  }
  console.log(`當前時間: ${scene.timeOfDay}`);
}