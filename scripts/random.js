// 確定性隨機數生成器
export default class Random {
  constructor(seed) {
    this.seed = seed;
  }
  
  // 返回 0-1 之間的隨機數
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  // 返回指定範圍內的整數
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  // 從數組中隨機選擇一個元素
  choice(array) {
    return array[Math.floor(this.next() * array.length)];
  }
  
  // 打亂數組順序
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
