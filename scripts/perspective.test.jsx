import { ProjectionSystem } from './perspective'
import { mat4 } from 'gl-matrix'

/**
 * 透視系統單元測試
 * @group unit
 */
describe('ProjectionSystem', () => {
  let projection

  beforeEach(() => {
    projection = new ProjectionSystem()
  })

  // 基本功能測試
  test('應正確初始化正交投影矩陣', () => {
    expect(projection.currentProjectionMatrix).toBeDefined()
    expect(mat4.determinant(projection.currentProjectionMatrix)).toBeCloseTo(1)
  })

  // 3D投影切換測試
  describe('切換至偽3D模式', () => {
    beforeEach(() => {
      projection.toggleProjectionMode()
    })

    test('應建立有效的透視投影矩陣', () => {
      const det = mat4.determinant(projection.currentProjectionMatrix)
      expect(det).not.toBe(0)
      expect(det).toBeCloseTo(-0.0002, 4) // 基於預設參數的期望值
    })

    test('應正確處理深度值', () => {
      const near = 0.1
      const far = 100
      const testDepth = (z) => {
        const vec = [0, 0, z, 1]
        mat4.transformVec4(projection.currentProjectionMatrix, vec, vec)
        return vec[3] !== 0 ? vec[2]/vec[3] : 0
      }
      expect(testDepth(near)).toBeCloseTo(-1)  // 近平面映射到 -1
      expect(testDepth(far)).toBeCloseTo(1)    // 遠平面映射到 1
    })
  })

  // 異常處理測試
  test('應處理無效的FOV值', () => {
    const originalFov = visualConfig.projection.perspective.fov
    visualConfig.projection.perspective.fov = 0
    expect(() => projection.rebuildProjectionMatrix()).toThrow('無效的視野角度')
    visualConfig.projection.perspective.fov = originalFov
  })
})

/**
 * 坐標系統單元測試
 * @group unit
 */
describe('CoordinateSystem', () => {
  let coordSystem

  beforeAll(() => {
    coordSystem = new (require('./core/CoordinateSystem').CoordinateSystem)()
  })

  test('透視除法應正確處理z值', () => {
    const testVec = { x: 100, y: 200, z: 10 }
    const result = coordSystem.perspectiveDivide(testVec)
    expect(result.x).toBe(10)
    expect(result.y).toBe(20)
  })

  test('邊界條件：z值為零時應防止除以零', () => {
    const testVec = { x: 50, y: 75, z: 0 }
    const result = coordSystem.perspectiveDivide(testVec)
    expect(result.x).toBe(50 / 1e-6)
    expect(result.y).toBe(75 / 1e-6)
  })
})