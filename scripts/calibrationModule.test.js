import { describe, test, expect, beforeEach } from 'vitest';
import { CalibrationSystem } from './calibration.js';
import { MOVEMENT_TOLERANCE } from './constants.js';

describe('校準模組', () => {
  let calibrationSystem;
  
  beforeEach(() => {
    calibrationSystem = new CalibrationSystem();
  });

  test('應在誤差範圍內計算移動軌跡', () => {
    const inputPath = [
      { x: 0, y: 0, timestamp: 0 },
      { x: 1.1, y: 0.9, timestamp: 1000 }
    ];
    const expected = { x: 1, y: 1 };

    calibrationSystem.analyze(inputPath);
    const result = calibrationSystem.getCalibratedPath()[1];
    
    expect(Math.abs(result.x - expected.x)).toBeLessThanOrEqual(MOVEMENT_TOLERANCE);
    expect(Math.abs(result.y - expected.y)).toBeLessThanOrEqual(MOVEMENT_TOLERANCE);
  });
});