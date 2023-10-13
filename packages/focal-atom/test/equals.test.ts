import { structEq } from '../src/equals'

describe('structEq', () => {
  describe('promises', () => {
    it('matches exact same promises', () => {
      const p1 = Promise.resolve(1)
      const p2 = Promise.resolve(1)

      expect(structEq(p1, p1)).toEqual(true)
      expect(structEq(p2, p2)).toEqual(true)
      expect(structEq(p1, p2)).toEqual(false)
    })

    it('matches exact same thenables', () => {
      const p1 = { then() {} }
      const p2 = { then() {} }

      expect(structEq(p1, p1)).toEqual(true)
      expect(structEq(p2, p2)).toEqual(true)
      expect(structEq(p1, p2)).toEqual(false)
    })
  })
})
