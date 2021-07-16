import { hasAny, hasNone } from './index'

test('hasAny', () => {
   expect(hasAny(['a'])({ a: 1, b: 2 })).toBe(true)
   expect(hasAny(['c'])({ a: 1, b: 2 })).toBe(false)
})

test('hasNone', () => {
   expect(hasNone(['c'])({ a: 1, b: 2 })).toBe(true)
   expect(hasNone(['a'])({ a: 1, b: 2 })).toBe(false)
   expect(hasNone(['a', 'c'])({ a: 1, b: 2 })).toBe(false)
})
