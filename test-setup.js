import { configure } from '@testing-library/dom';
import { JSDOM } from 'jsdom';
import 'jest-canvas-mock';

// 模擬瀏覽器環境
const dom = new JSDOM('<!doctype html><html><body><canvas id="gameCanvas"></canvas></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
  resources: 'usable',
  runScripts: 'dangerously'
});

// 設置全局變數
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
// 模擬Phaser核心功能
global.Phaser = {
  ...require('phaser'),
  Math: {
    Matrix4: {
      Identity: () => ({
        rotateX: jest.fn().mockReturnThis(),
        rotateZ: jest.fn().mockReturnThis(),
        scale: jest.fn().mockReturnThis(),
        setDepth: jest.fn()
      })
    }
  }
};

// 模擬動畫幀API
global.requestAnimationFrame = (cb) => setTimeout(cb, 1000/60);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// 配置測試庫
configure({ testIdAttribute: 'data-test' });

// 增強HTMLVideoElement模擬
global.HTMLVideoElement = class HTMLVideoElement extends dom.window.HTMLElement {
  constructor() {
    super();
    this.readyState = 4;
    this.play = () => Promise.resolve();
    this.pause = () => {};
    this.load = () => {};
    this.currentTime = 0;
    this.duration = 0;
    // 修正requestVideoFrameCallback實作，加入timeout處理
    this._callbacks = new Map();
    this.requestVideoFrameCallback = (callback) => {
      const rafId = requestAnimationFrame((timestamp) => {
        const videoInfo = {
          presentationTime: timestamp,
          expectedDisplayTime: timestamp + 16.666,
          width: 800,
          height: 600,
          mediaTime: this.currentTime,
          presentedFrames: performance.now() / 16.666 | 0,
          processingDuration: 2,
          captureTime: timestamp - 100,
          receiveTime: timestamp - 50,
          rtpTimestamp: timestamp * 90 // 根據90kHz時鐘
        };
        callback(timestamp, videoInfo);
        this._callbacks.delete(rafId);
      });
      this._callbacks.set(rafId, callback);
      return rafId;
    };
    this.cancelVideoFrameCallback = (id) => {
      if (this._callbacks.has(id)) {
        cancelAnimationFrame(id);
        this._callbacks.delete(id);
      }
    };
  }
};

global.HTMLMediaElement = class HTMLMediaElement extends dom.window.HTMLVideoElement {};

// Canvas模擬配置
const canvas = document.getElementById('gameCanvas');
canvas.width = 800;
canvas.height = 600;

// 擴展WebGL2支援
const ctxMock = {
  // 保留原有Canvas方法
  fillRect: function() {},
  clear: function() {},
  
  // WebGL2擴展方法
  getExtension: function() { return null; },
  getParameter: function(pname) {
    if (pname === 0x0D57) return 1; // DEPTH_BITS
    if (pname === 0x884E) return 0x0200; // DEPTH_TEST
    return 0;
  },
  enable: function(cap) {
    if (cap === 0x0B71) { // DEPTH_TEST
      this.depthTestEnabled = true;
    }
  },
  disable: function(cap) {
    if (cap === 0x0B71) {
      this.depthTestEnabled = false;
    }
  },
  depthFunc: function(func) {
    this.depthFuncValue = func;
  },
  depthMask: function(flag) {
    this.depthMaskValue = flag;
  }
};
117|
118| // 坐標系統測試案例（僅在測試環境執行）
119| // 坐標系統測試案例
120| if (typeof describe === 'function') {
121|   const { CoordinateSystem } = require('./scripts/coordinateSystem');
122|   const { test, expect } = require('@jest/globals');
122|
123|   describe('CoordinateSystem 模組', () => {
124|     let coordSystem;
125|
126|     beforeEach(() => {
127|       coordSystem = new CoordinateSystem({
128|         canvasWidth: 800,
129|         canvasHeight: 600,
130|         tileSize: 32
131|       });
132|     });
133|
134|     test('應正確進行2D到2.5D坐標轉換', () => {
135|       const result = coordSystem.projectTo2_5D(3, 2);
136|       expect(result.x).toBeCloseTo(128, 1);  // 3*32 + (2*32)*0.5
137|       expect(result.y).toBeCloseTo(55.4, 1); // 2*32*0.866
138|     });
139|
140|     test('深度值應影響Y軸位置', () => {
141|       const result = coordSystem.projectTo2_5D(3, 2, 1.5);
142|       expect(result.y).toBeCloseTo(55.4 - (1.5 * 16), 1); // 每個z單位減少0.5*tileSize
143|     });
144|
145|     test('應正確更新深度緩衝', () => {
146|       coordSystem.updateDepthBuffer(100, 200, 0.3);
147|       const index = 200 * 800 + 100;
148|       expect(coordSystem.depthBuffer[index]).toBe(0.3);
149|     });
150|
151|     test('重置深度緩衝應恢復預設值', () => {
152|       coordSystem.updateDepthBuffer(100, 200, 0.3);
153|       coordSystem.resetDepthBuffer();
154|       expect(coordSystem.depthBuffer.every(v => v === 1.0)).toBe(true);
155|     });
156|   });
157| }
  getExtension: () => null,
  getParameter: (pname) => {
    if (pname === 0x0D57) return 1; // DEPTH_BITS
    if (pname === 0x884E) return 0x0200; // DEPTH_TEST
    return 0;
  },
  enable: (cap) => {
    if (cap === 0x0B71) { // DEPTH_TEST
      ctxMock.depthTestEnabled = true;
    }
  },
  disable: (cap) => {
    if (cap === 0x0B71) { // DEPTH_TEST
      ctxMock.depthTestEnabled = false;
    }
  },
  depthFunc: (func) => {
    ctxMock.currentDepthFunc = func;
  },
  depthMask: (flag) => {
    ctxMock.depthWriteEnabled = flag;
  },
  blendFuncSeparate: () => {},
  viewport: () => {},
  createTexture: () => ({}),
  bindTexture: () => {},
  texImage2D: () => {},
  texParameteri: () => {},
  generateMipmap: () => {},
  createBuffer: () => ({}),
  bindBuffer: () => {},
  bufferData: () => {},
  createShader: () => ({}),
  shaderSource: () => {},
  compileShader: () => {},
  getShaderParameter: () => true,
  createProgram: () => ({}),
  attachShader: () => {},
  linkProgram: () => {},
  getProgramParameter: () => true,
  useProgram: () => {},
  getAttribLocation: () => 0,
  enableVertexAttribArray: () => {},
  vertexAttribPointer: () => {},
  drawArrays: () => {},
};

canvas.getContext = (type) => {
  if (type === 'webgl2') {
    return Object.assign({}, ctxMock, {
      drawingBufferWidth: 800,
      drawingBufferHeight: 600
    });
  }
  return ctxMock;
};

// 設置全域WebGL變數
global.WebGLRenderingContext = dom.window.WebGLRenderingContext;
global.WebGL2RenderingContext = dom.window.WebGL2RenderingContext;

// 模擬效能計時API
global.performance = {
  now: () => Date.now()
};

// 模擬裝置像素比
global.devicePixelRatio = 1;

// 新增深度緩衝測試案例
describe('深度緩衝驗證', () => {
  let gl;

  beforeEach(() => {
    gl = canvas.getContext('webgl2');
  });

  test('應正確啟用深度測試', () => {
    gl.enable(gl.DEPTH_TEST);
    expect(gl.depthTestEnabled).toBe(true);
  });

  test('應正確禁用深度測試', () => {
    gl.disable(gl.DEPTH_TEST);
    expect(gl.depthTestEnabled).toBe(false);
  });

  test('應設定正確的深度函式', () => {
    gl.depthFunc(gl.LEQUAL);
    expect(gl.currentDepthFunc).toBe(gl.LEQUAL);
  });

  test('應控制深度緩衝寫入狀態', () => {
    gl.depthMask(true);
    expect(gl.depthWriteEnabled).toBe(true);
    gl.depthMask(false);
    expect(gl.depthWriteEnabled).toBe(false);
  });

  test('應回傳正確的深度緩衝位元數', () => {
    expect(gl.getParameter(gl.DEPTH_BITS)).toBe(1);
  });
});
// 視覺回歸測試設定
import { configure } from 'vrtest/configure';
import { visualRegressionTest } from 'vrtest';

// 設定基準截圖路徑
configure({
  imagePath: './test/vrt/baseline/',
  diffPath: './test/vrt/diff/',
  reportPath: './test/vrt/reports/'
});

// 全域視覺測試函式
global.visualTest = (name, callback) => {
  test(name, async () => {
    const result = await visualRegressionTest({
      component: callback(),
      testName: name,
      selector: '#test-root'
    });
    expect(result.mismatch).toBeLessThanOrEqual(0.01);
  });
};

// 擴充Canvas比對功能
function toMatchCanvasSnapshot(canvas, threshold = 0.01) {
  const customConfig = {
    failureThreshold: threshold,
    failureThresholdType: 'percent'
  };
  return visualRegressionTest.toMatchImageSnapshot.call(this, canvas, customConfig);
}
expect.extend({ toMatchCanvasSnapshot });