/**
 * 測試環境初始化設定
 * 此檔案用於設置測試環境共用的模擬物件與全域變數
 */
import { JSDOM } from 'jsdom';
import 'vitest-canvas-mock';
import Phaser from 'phaser';

// 初始化JSDOM環境
const dom = new JSDOM('<!DOCTYPE html>', {
  url: 'http://localhost:5500/',
  pretendToBeVisual: true
});

// 設定全局DOM物件
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// 模擬瀏覽器API
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.performance = { now: () => Date.now() };

// 模擬WebGL環境
global.WebGLRenderingContext = dom.window.WebGLRenderingContext;
global.WebGL2RenderingContext = dom.window.WebGL2RenderingContext;

// 模擬localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key],
    setItem: (key, value) => (store[key] = value.toString()),
    clear: () => (store = {}),
    removeItem: (key) => delete store[key]
  };
})();
global.localStorage = localStorageMock;

import { expect } from 'vitest';
import * as mat4 from './node_modules/gl-matrix/esm/mat4.js';

// 設定全域模組
globalThis.mat4 = mat4;

// 禁用 Phaser 偵測器功能
Phaser.Core.Config.prototype.spectatorMode = false;

// 簡化 Phaser 模擬設定
Phaser.GameObjects.GameObjectFactory.prototype.container = () => ({
  setPosition: () => {},
  setRotation: () => {},
  add: () => {}
});