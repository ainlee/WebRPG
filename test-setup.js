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
  // ...保留原有Canvas方法...
  // 新增WebGL2支援
  getExtension: () => null,
  getParameter: () => 0,
  enable: () => {},
  disable: () => {},
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