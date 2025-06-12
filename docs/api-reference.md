# API 參考文件 v2.5.0

## 核心模組
```typescript
interface NetworkConfig {
  iceServers: RTCIceServer[]
  heartbeatInterval?: number
  maxReconnectAttempts?: number
}

class NetworkManager {
  constructor(config: NetworkConfig) {
    // 初始化網路連接
  }

  /**
   * 建立P2P連線
   * @param offer - 遠端SDP描述
   * @returns 本地SDP描述
   */
  async connect(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    // 實現WebRTC協商流程
  }

  /**
   * 自動重連機制
   * @param delayMs - 重試間隔(預設5000ms)
   */
  startReconnect(delayMs = 5000): void {
    // 指數退避重連邏輯
  }
}
```

## 座標系統
```typescript
class CoordinateSystem {
  /**
   * 世界座標轉螢幕座標
   * @param x - 世界X軸
   * @param y - 世界Y軸
   * @param z - 高度值(可選)
   */
  projectToScreen(x: number, y: number, z = 0): {x: number, y: number} {
    return {
      x: (x - y) * TILE_WIDTH / 2,
      y: (x + y) * TILE_HEIGHT / 2 - z * ELEVATION_FACTOR
    };
  }
}
```

## 效能監控
```javascript
export class PerformanceMonitor {
  // 追蹤畫面更新率
  trackFPS() {
    let frameCount = 0;
    const fpsElement = document.getElementById('fps-counter');
    setInterval(() => {
      fpsElement.textContent = `FPS: ${frameCount}`;
      frameCount = 0;
    }, 1000);
    
    const update = () => {
      frameCount++;
      requestAnimationFrame(update);
    };
    update();
  }
}