import * as test from 'tape'
import { Lens } from '../src'
import { structEq } from '../src/utils'
import * as Json from '../src/lens/json'

function roundtrip<T, U>(
  t: test.Test,
  name: string,
  l: Lens<T, U>,
  obj: T, oldVal: U, newVal: U
) {
  t.test(`lens roundtrip: ${name}`, t => {
    t.is(l.get(obj), oldVal, 'get')
    t.is(l.get(l.set(newVal, obj)), newVal, 'set')
    t.end()
  })
}

// tslint:disable-next-line
// see https://www.schoolofhaskell.com/school/to-infinity-and-beyond/pick-of-the-week/a-little-lens-starter-tutorial#the-lens-laws-
function testLaws<T, U>(
  t: test.Test,
  l: Lens<T, U>,
  object: T, value1: U, value2: U,
  name: string
) {
  t.test(`lens laws: ${name}`, t => {
    t.assert(structEq(object, l.set(l.get(object), object)), 'get-put')
    t.assert(structEq(value1, l.get(l.set(value1, object))), 'put-get')
    t.assert(structEq(l.set(value2, l.set(value1, object)), l.set(value2, object)), 'put-put')
    t.end()
  })
}

function testLens<O, P>(
  t: test.Test,
  name: string,
  l: Lens<O, P>,
  obj: O, currentValue: P,
  newValue1: P, newValue2: P
) {
  testLaws(t, l, obj, newValue1, newValue2, name)
  roundtrip(t, name, l, obj, currentValue, newValue1)
}

test('identity', t => {
  testLens(t, 'basic',
    Lens.identity<any>(),
    'any', 'any', 'other', 'another')

  testLens(t, 'composed',
    Lens.identity<any>(),
    'any', 'any', 'other', 'another')

  t.end()
})

test('json', t => {
  t.test('simple', t => {
    const a = Lens.key('a')
    const b = Lens.key('b')
    const c = Lens.key('c')
    const i0 = Lens.index(0)
    const i1 = Lens.index(1)

    testLens(t, 'keys',
      a,
      { a: 'one' }, 'one', 'two', 'three')

    testLens(t, 'indices',
      i0,
      ['one'], 'one', 'two', 'three')

    testLens(t, 'composed',
      a.compose(i0).compose(b).compose(i1).compose(c),
      { a: [{ b: ['boo', { c: 'one' }] }] },
      'one', 'two', 'three')

    testLens(t, 'composed, right associative',
      a.compose(i0.compose(b.compose(i1.compose(c)))),
      { a: [{ b: ['boo', { c: 'one' }] }] },
      'one', 'two', 'three')

    testLens(t, 'composed with Lens.compose',
      Lens.compose(a, i0, b, i1, c),
      { a: [{ b: ['boo', { c: 'one' }] }] },
      'one', 'two', 'three')

    t.end()
  })

  t.test('typed', t => {
    interface Leg { length: string }
    interface Raccoon { legs: Leg[] }
    interface Forest { raccoons: Raccoon[] }

    const forest: Forest = {
      raccoons: [
        { legs: [{ length: 'short' }, { length: 'long' }] },
        { legs: [{ length: 'fat' }, { length: 'thick' }] }
      ]
    }

    const raccoons = Lens.prop((x: Forest) => x.raccoons)
    const legs = Lens.prop((x: Raccoon) => x.legs)
    const length = Lens.prop((x: Leg) => x.length)

    testLens(t, 'case 1',
      raccoons
        .compose(Lens.index<Raccoon>(0))
        .compose(legs)
        .compose(Lens.index<Leg>(0))
        .compose(length),
      forest,
      'short', 'bold', 'cursive')

    testLens(t, 'case 2',
      raccoons
        .compose(Lens.index<Raccoon>(1))
        .compose(legs)
        .compose(Lens.index<Leg>(1))
        .compose(length),
      forest,
      'thick', 'broken', 'beautiful')

    testLens(t, 'compose',
      Lens.compose(raccoons, Lens.index(0), legs, Lens.index(1), length),
      forest,
      'long', 'metal', 'deus ex')

    t.end()
  })

  t.test('find', t => {
    const xs = [1, 2, 3, 4, 5]
    const l = Lens.find((x: number) => x === 3)

    const oldVal = 3
    const newVal = 5

    t.is(l.get(xs), oldVal, 'get')
    t.is(l.get(l.set(newVal, xs)), undefined, 'set')

    t.end()
  })

  t.test('withDefault', t => {
    const s = { a: 5, b: 6 } // c is undefined
    const l1 = Lens.key<number>('a').compose(Lens.withDefault(666))
    const l2 = Lens.key<number>('c').compose(Lens.withDefault(666))

    t.is(l1.get(s), 5, 'get defined')
    t.deepEqual(l1.set(6, s), { a: 6, b: 6 }, 'set defined')
    t.is(l2.get(s), 666, 'get undefined')
    t.deepEqual(l2.set(6, s), { a: 5, b: 6, c: 6 }, 'set undefined')

    t.end()
  })

  t.test('withDefault 2', t => {
    const s = { a: 5, b: 6 } // c is undefined
    const l1 = Lens.key<number>('a').compose(Lens.withDefault(666))
    const l2 = Lens.key<number>('c').compose(Lens.withDefault(666))

    t.is(l1.get(s), 5, 'get defined')
    t.deepEqual(l1.set(6, s), { a: 6, b: 6 }, 'set defined')
    t.is(l2.get(s), 666, 'get undefined')
    t.deepEqual(l2.set(6, s), { a: 5, b: 6, c: 6 }, 'set undefined')

    t.end()
  })

  t.test('withDefault lens tests', t => {
    const s = { a: 5, b: 6 } // c is undefined
    const l1 = Lens.key<number>('a').compose(Lens.withDefault(666))
    const l2 = Lens.key<number>('c').compose(Lens.withDefault(666))

    testLens(t, 'test 1', l1, s, 5, 6, 7)
    testLens(t, 'test 2', l2, s, 666, 6, 7)

    t.end()
  })

  t.test('index + withDefault #17', t => {
    testLens(t,
      'test lens, basic',
      Lens.index<number>(0).compose(Lens.withDefault(5)),
      [1, 2, 3], 1, 10, 5
    )

    testLens(t,
      'testLens, default values',
      Lens.index<number>(0).compose(Lens.withDefault(5)),
      [5, 5, 5], 5, 10, 5
    )

    t.end()
  })

  t.test('withDefault transforms Prism into Lens', t => {
    const s = { a: 5, b: 6 } // c is undefined
    const l1 = Lens.key<number>('a').compose(Lens.withDefault(666))
    const l2 = Lens.key<number>('c').compose(Lens.withDefault(666))

    // the lines below should compile
    let _: number = l1.get(s)
    _ = l2.get(s)

    t.end()
  })

  t.test('type safe key', t => {
    const s = { a: 5, b: '6' }

    testLens<typeof s, (typeof s)['a']>(
      t, 'type safe key 1',
      Lens.key<typeof s>()('a'), s, 5, 6, 7
    )

    testLens<typeof s, (typeof s)['b']>(
      t, 'type safe key 2',
      Lens.key<typeof s>()('b'), s, '6', '7', 'hello'
    )

    t.end()
  })

  t.end()
})

test('property expressions', t => {
  t.test('basic', t => {
    t.deepEqual(Json.extractPropertyPath((a: any) => a.b), ['b'])
    t.deepEqual(Json.extractPropertyPath((a: any) => a.b.c), ['b', 'c'])
    t.deepEqual(Json.extractPropertyPath((a: any) => a.b.c.d), ['b', 'c', 'd'])

    t.throws(() => Json.extractPropertyPath((a: any) => a[5]))
    t.throws(() => Json.extractPropertyPath((_: any) => 0))
    t.throws(() => Json.extractPropertyPath(({ hi }: any) => hi))

    t.throws(() => Json.parsePropertyPath('function (x) { x(); return x.a; }'))
    t.throws(() => Json.parsePropertyPath('function (x) { y(); return x.a; }'))

    t.end()
  })

  t.test('cross-browser', t => {
    t.deepEqual(Json.parsePropertyPath(
      'function (x) { return x.a; }'), ['a'], 'chrome')

    t.deepEqual(Json.parsePropertyPath(
      'function (x) { "use strict"; return x.a; }'), ['a'], 'firefox')

    t.end()
  })

  t.test('wallaby.js', t => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'wallaby'

    t.deepEqual(Json.parsePropertyPath(
      'function (x) { $_$wf(21); return $_$w(124, 53), x.a; }'), ['a'])

    t.throws(() => Json.parsePropertyPath(
      'function (x) { $_$wf(21); return x.a, $_$w(124, 53); }'))

    process.env.NODE_ENV = originalNodeEnv
    t.end()
  })

  t.end()
})
