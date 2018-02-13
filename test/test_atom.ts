// tslint:disable no-unnecessary-local-variable
import * as test from 'tape'
import { Atom, Lens, ReadOnlyAtom } from '../src'
import { structEq } from '../src/utils'

function testAtom(t: test.Test, newAtom: (x: number) => Atom<number>) {
  t.test('basic', t => {
    t.plan(7)

    const a = newAtom(1)
    let expected = 1

    const cb = (x: number) => {
      t.is(x, expected, 'expected new value')
      t.is(a.get(), expected, 'expected current value')
    }

    const subscription = a.subscribe(cb)

    t.is(a.get(), 1, 'get initial value')

    expected = 2
    a.modify(x => x + 1)

    expected = 500
    a.set(500)

    subscription.unsubscribe()
  })

  t.test('observable semantics: distinct values', t => {
    const a = newAtom(1)
    const observations: number[] = []
    const cb = (x: number) => observations.push(x)
    const subscription = a.subscribe(cb)

    ; [2, 3, 3, 3, 1].forEach(x => a.set(x))

    t.assert(structEq(observations, [1, 2, 3, 1]))

    subscription.unsubscribe()
    t.end()
  })
}

function testDerivedAtom(
  t: test.Test,
  createDerived: (
    a: Atom<number>,
    f: (x: number) => number,
    onCalled: (a: number) => void
  ) => ReadOnlyAtom<number>,
  create: (x: number) => Atom<number> = Atom.create
) {
  t.test('unsub in modify', t => {
    const a = create(5)

    const viewFnCalls: number[] = []
    const os: number[] = []

    const v = createDerived(a, x => x + 1, x => viewFnCalls.push(x))

    t.deepEqual(viewFnCalls, [])
    t.deepEqual(os, [])

    const sub = v.subscribe(x => {
      os.push(x)
    })
    t.deepEqual(viewFnCalls, [5])
    t.deepEqual(os, [6])

    a.modify(x => x + 1)
    t.deepEqual(viewFnCalls, [5, 6])
    t.deepEqual(os, [6, 7])

    a.modify(x => {
      sub.unsubscribe()
      return 0
    })
    t.deepEqual(viewFnCalls, [5, 6])
    t.deepEqual(os, [6, 7])

    t.end()
  })

  t.test('resubscribe', t => {
    const a = create(5)
    const v = createDerived(a, x => x + 1, () => { /* no-op */ })

    const os: number[] = []
    const sub1 = v.subscribe(x => os.push(x))
    t.deepEqual(os, [6], 'immediate observation on subscription')

    a.modify(x => x + 1)
    t.deepEqual(os, [6, 7], 'observation on modify')

    sub1.unsubscribe()

    a.modify(x => x + 1)
    t.deepEqual(os, [6, 7], 'no observation after unsubscription')

    const sub2 = v.subscribe(x => os.push(x))
    t.deepEqual(os, [6, 7, 8], 'immediate observation on subscription 2')

    a.modify(x => x + 1)
    t.deepEqual(os, [6, 7, 8, 9], 'observation on modify 2')

    sub2.unsubscribe()

    a.modify(x => x + 1)
    t.deepEqual(os, [6, 7, 8, 9], 'no observation after unsubscription 2')

    t.end()
  })

  t.test('multiple subscriptions', t => {
    const a = create(5)
    const v = createDerived(a, x => x + 1, () => { /* no-op */ })

    const os1: number[] = []
    const sub1 = v.subscribe(x => os1.push(x))

    const os2: number[] = []
    const sub2 = v.subscribe(x => os2.push(x))

    t.deepEqual(os1, os2, 'same initial observations upon subscription')

    a.set(6)
    t.deepEqual(os1, os2, 'same observations on modify')

    sub1.unsubscribe()
    a.set(7)
    t.deepEqual(os1, [6, 7], 'no modify observation after unsub 1')
    t.deepEqual(os2, [6, 7, 8], 'observation on 2 after unsub on 1')

    sub2.unsubscribe()
    a.set(8)
    t.deepEqual(os1, [6, 7], 'no more observations')
    t.deepEqual(os2, [6, 7, 8], 'no more observations on 2')

    t.end()
  })
}

test('atom', t => {
  t.test('plain', t => {
    testAtom(t, x => Atom.create(x))
  })

  t.test('lens', t => {
    t.test('lensed, property expression', t => {
      testAtom(t, x => {
        const source = Atom.create({ a: x })
        const lensed = source.lens(x => x.a)
        return lensed
      })
    })

    t.test('lensed, nested property expression', t => {
      testAtom(t, x => {
        const source = Atom.create({ a: { b: { c: x } } })
        const lensed = source.lens(x => x.a.b.c)
        return lensed
      })
    })

    t.test('lensed, chained lenses', t => {
      testAtom(t, x => {
        const source = Atom.create({ a: { b: { c: x } } })
        const lensed = source.lens(x => x.a).lens(x => x.b).lens(x => x.c)
        return lensed
      })
    })

    t.test('lensed, nested safe key', t => {
      testAtom(t, x => {
        const source = Atom.create({ a: { b: { c: x } } })
        const lensed = source.lens('a', 'b', 'c')
        return lensed
      })
    })

    t.test('lensed, safe key, chained lenses', t => {
      testAtom(t, x => {
        const source = Atom.create({ a: { b: { c: x } } })
        const lensed = source.lens('a').lens('b').lens('c')
        return lensed
      })
    })

    t.test('lensed, chained + complex', t => {
      const source = Atom.create({ a: { b: { c: 5 } } })
      const lensed =
        source
          .lens(x => x.a)
          .lens(x => x.b)
          .lens(x => x.c)
          .lens(
            Lens.create(
              (x: number) => x + 1,
              (v: number, _: number) => v - 1))

      t.isEqual(lensed.get(), 6)

      lensed.set(6)

      t.isEqual(lensed.get(), 6)

      t.end()
    })

    t.test('lensed, safe key, chained + complex', t => {
      const source = Atom.create({ a: { b: { c: 5 } } })
      const lensed =
        source
          .lens('a').lens('b').lens('c')
          .lens(
            Lens.create(
              (x: number) => x + 1,
              (v: number, _: number) => v - 1))

      t.isEqual(lensed.get(), 6)

      lensed.set(6)

      t.isEqual(lensed.get(), 6)

      t.end()
    })

    t.test('lens then view', t => {
      const x1 = Atom.create({ a: { b: 5 } })
      const x2 = x1.lens(x => x.a).view(x => x.b).view(x => x + 1)
      const x3 = x1.lens(x => x.a).lens(x => x.b)

      t.isEqual(x3.get(), 5)
      t.isEqual(x2.get(), 6)

      x3.set(6)

      t.isEqual(x3.get(), 6)
      t.isEqual(x2.get(), 7)
      t.assert(structEq({ a: { b: 6 } }, x1.get()))

      t.end()
    })

    t.test('index lens', t => {
      t.test('generic', t => {
        testAtom(t, x => {
          const source = Atom.create([x, 2, 3])
          const first = source.lens(
            Lens.index<number>(0)
              // assert element is non-undefined
              .compose(Lens.create(
                (x: number | undefined) => x!,
                (v, _) => v
              ))
          )
          return first
        })
      })

      t.test('atom interface', t => {
        const source = Atom.create([1, 2, 3])
        const first = source.lens(Lens.index<number>(0))

        t.isEqual(first.get(), 1, 'initial value')

        first.set(10)

        t.isEqual(first.get(), 10, 'set through lens')
        t.assert(structEq(source.get(), [10, 2, 3]), 'propagates to source')

        source.set([100, 2, 3])

        t.isEqual(first.get(), 100, 'set through source')

        source.set([2, 3])

        t.isEqual(first.get(), 2, 'get after element removed')

        t.end()
      })

      t.test('observing lensed', t => {
        const source = Atom.create([1, 2, 3])
        const first = source.lens(Lens.index<number>(0))

        const observations: number[] = []

        const cb = (x: number) => {
          observations.push(x)
        }
        const subscription = first.subscribe(cb)

        first.set(10)
        source.set([100, 2, 3])
        source.set([2, 3])
        source.set([1000, 2, 3])

        t.isEquivalent(
          observations,
          [1, 10, 100, 2, 1000])

        subscription.unsubscribe()
        t.end()
      })
    })

    t.end()
  })

  t.test('view', t => {
    t.test('readonly, getter, simple', t => {
      const source = Atom.create(5)
      const view = source.view(x => x + 1)

      t.isEqual(source.get(), 5)
      t.isEqual(view.get(), 6)

      source.modify(x => x + 1)

      t.isEqual(source.get(), 6)
      t.isEqual(view.get(), 7)

      t.end()
    })

    t.test('readonly, safe key, simple', t => {
      const source = Atom.create({ a: 5 })
      const view = source.view('a')

      t.isEqual(view.get(), 5)

      source.modify(x => ({ a: x.a + 1 }))

      t.isEqual(view.get(), 6)

      t.end()
    })

    t.test('readonly, safe key, complex', t => {
      const source = Atom.create({ a: { b: { c: 5 } } })
      const view = source.view('a', 'b', 'c')

      t.isEqual(view.get(), 5)

      source.modify(x => ({ a: { b: { c: x.a.b.c + 1 } } }))

      t.isEqual(view.get(), 6)

      t.end()
    })

    t.test('observable semantics: distinct values', t => {
      const source = Atom.create(1)
      const view = source.view(x => x + 1)

      const sourceOs: number[] = []
      const sourceSub = source.subscribe(x => sourceOs.push(x))

      const viewOs: number[] = []
      const viewSub = view.subscribe(x => viewOs.push(x))

      ; [2, 2, 2, 3, 3, 3, 1, 1, 1].forEach(x => source.set(x))

      t.deepEqual(viewOs, [2, 3, 4, 2])
      t.deepEqual(sourceOs, [1, 2, 3, 1])

      sourceSub.unsubscribe()
      viewSub.unsubscribe()
      t.end()
    })

    testDerivedAtom(t, (a, f, onCalled) => a.view(x => {
      onCalled(x)
      return f(x)
    }))

    t.test('complex expression', t => {
      const source = Atom.create({ a: { b: { c: 5 } } })
      const lensed = source.lens(x => x.a.b.c)
      const view = lensed.view(x => x + 5 > 0)

      t.isEqual(view.get(), true)

      lensed.set(6)
      t.isEqual(view.get(), true)

      lensed.set(-5)
      t.isEqual(view.get(), false)

      t.end()
    })

    t.end()
  })

  t.test('atom value caching', t => {
    t.test('static', t => {
      const source = Atom.create(-1)

      let called1 = 0
      const a1 = source.view(x => {
        called1++
        return x + 1
      })

      let called2 = 0
      const a2 = a1.view(x => {
        called2++
        return -x
      })

      let called3 = 0
      const a3 = a2.view(x => {
        called3++
        return `Hi ${x}`
      })

      let called4 = 0
      const a4 = a2.view(x => {
        called4++
        return `Ho ${x}`
      })

      function testCalls(a: number, b: number, c: number, d: number) {
        t.deepEqual([called1, called2, called3, called4], [a, b, c, d])
      }

      source.set(0)
      testCalls(0, 0, 0, 0)

      t.isEqual(a3.get(), 'Hi -1')
      testCalls(1, 1, 1, 0)

      t.isEqual(a4.get(), 'Ho -1')
      testCalls(2, 2, 1, 1)

      source.set(1)
      testCalls(2, 2, 1, 1)

      t.end()
    })

    t.test('subscribed', t => {
      const source = Atom.create(0)

      let called1 = 0
      const a1 = source.view(x => {
        console.log('a1', called1, x)
        called1++
        return x + 1
      })

      let called2 = 0
      const a2 = a1.view(x => {
        console.log('a2', called2, x)
        called2++
        return -x
      })

      let called3 = 0
      const a3 = a2.view(x => {
        console.log('a3', called3, x)
        called3++
        return x * 2
      })

      let called4 = 0
      const a4 = a3.view(x => {
        console.log('a4', called4, x)
        called4++
        return `Hi ${x}`
      })

      let called5 = 0
      const a5 = a3.view(x => {
        console.log('a5', called5, x)
        called5++
        return `Ho ${x}`
      })

      let called6 = 0
      const a6 = a3.view(x => {
        console.log('a6', called6, x)
        called6++
        return `HU ${x}`
      })

      function testCalls(
        a: number, b: number, c: number, d: number, e: number, f: number,
        msg: string
      ) {
        t.deepEqual(
          [called1, called2, called3, called4, called5, called5],
          [a, b, c, d, e, f],
          msg
        )
      }

      const test = a4.merge(a5, a6)
      testCalls(0, 0, 0, 0, 0, 0, 'no calls initially')

      const observations: string[] = []
      const sub = test.subscribe(x => observations.push(x))
      testCalls(1, 1, 1, 1, 1, 1, 'one call each on subscribe (initial emit)')

      source.set(1)
      testCalls(2, 2, 2, 2, 2, 2, 'two calls each after subscribe + 1 set')

      source.set(2)
      testCalls(3, 3, 3, 3, 3, 3, '3 calls each after subscribe + 2 sets')

      t.deepEqual(
        observations,
        [
          'Hi -2', 'Ho -2', 'HU -2',
          'Hi -4', 'Ho -4', 'HU -4',
          'Hi -6', 'Ho -6', 'HU -6'
        ]
      )

      sub.unsubscribe()
      t.end()
    })

    t.test('with Atom.combine/static', t => {
      const source = Atom.create(0)

      let called1 = 0
      const a1 = source.view(x => {
        console.log('a1', called1, x)
        called1++
        return x + 1
      })

      let called2 = 0
      const a2 = a1.view(x => {
        console.log('a2', called2, x)
        called2++
        return -x
      })

      let called3 = 0
      const a3 = a2.view(x => {
        console.log('a3', called3, x)
        called3++
        return x * 2
      })

      let called4 = 0
      const a4 = a3.view(x => {
        console.log('a4', called4, x)
        called4++
        return `Hi ${x}`
      })

      let called5 = 0
      const a5 = a3.view(x => {
        console.log('a5', called5, x)
        called5++
        return `Ho ${x}`
      })

      let called6 = 0
      const a6 = a3.view(x => {
        console.log('a6', called6, x)
        called6++
        return `HU ${x}`
      })

      function testCalls(
        a: number, b: number, c: number, d: number, e: number, f: number,
        msg: string
      ) {
        t.deepEqual(
          [called1, called2, called3, called4, called5, called5],
          [a, b, c, d, e, f],
          msg
        )
      }

      testCalls(0, 0, 0, 0, 0, 0, 'no calls initially')

      const combined = Atom.combine(a4, a5, a6, (x, y, z) => [x, y, z])
      testCalls(0, 0, 0, 0, 0, 0, 'no calls after creating Atom.combined')

      t.deepEqual(combined.get(), ['Hi -2', 'Ho -2', 'HU -2'])

      // it's ok to have 3 calls here each as until we are subscribed to this
      // atom it doesn't track its sources
      testCalls(3, 3, 3, 1, 1, 1, '3 + 1 call after .get()')

      source.set(1)
      testCalls(3, 3, 3, 1, 1, 1, 'no new calls after source .set()')

      t.deepEqual(a4.get(), 'Hi -4')
      testCalls(4, 4, 4, 2, 1, 1, 'calls after .get() on intermediate node')

      t.end()
    })
  })

  t.test('combine', t => {
    t.test('constant', t => {
      const combined = Atom.combine(
        Atom.create(1), Atom.create(false), Atom.create('test'),
        (x, y, z) => y && x < 0 ? z.toUpperCase() : 'NO'
      )

      t.isEqual(combined.get(), 'NO')

      t.end()
    })

    t.test('dynamic, unsubscribed', t => {
      const s1 = Atom.create(1)
      const s2 = Atom.create(false)
      const s3 = Atom.create('test')

      const combined = Atom.combine(
        s1, s2, s3,
        (x, y, z) => y && x < 0 ? z.toUpperCase() : 'NO'
      )

      t.isEqual(combined.get(), 'NO')

      s1.set(-1)
      t.isEqual(combined.get(), 'NO')

      s2.set(true)
      t.isEqual(combined.get(), 'TEST')

      s3.set('heLLo')
      t.isEqual(combined.get(), 'HELLO')

      s1.set(100)
      t.isEqual(combined.get(), 'NO')

      t.end()
    })

    t.test('dynamic, subscribed', t => {
      const s1 = Atom.create(1)
      const s2 = Atom.create(false)
      const s3 = Atom.create('test')
      const observations: string[] = []

      const combined = Atom.combine(
        s1, s2, s3,
        (x, y, z) => y && x < 0 ? z.toUpperCase() : 'NO'
      )

      const sub = combined.subscribe(x => observations.push(x))

      t.isEqual(combined.get(), 'NO')

      s1.set(-1)
      t.isEqual(combined.get(), 'NO')

      s2.set(true)
      t.isEqual(combined.get(), 'TEST')

      s3.set('heLLo')
      t.isEqual(combined.get(), 'HELLO')

      s1.set(100)
      t.isEqual(combined.get(), 'NO')

      t.deepEqual(observations, ['NO', 'TEST', 'HELLO', 'NO'])

      sub.unsubscribe()
      t.end()
    })

    testDerivedAtom(t, (a, f, onCalled) => Atom.combine(a, Atom.create(0), (a, b) => {
      onCalled(a)
      return f(a)
    }))
  })

  t.test('logger', t => {
    let consoleLogFireTime = 0

    const atom = Atom.create('bar')
    const consoleLogArguments: string[][] = []
    const logAtom = Atom.log(atom, (prevState: string, newState: string) => {
      consoleLogFireTime++
      consoleLogArguments.push([prevState, newState])
    })
    logAtom.set('foo')

    t.equal(consoleLogFireTime, 2)
    t.deepEqual(consoleLogArguments, [['bar', 'bar'], ['bar', 'foo']])

    t.end()
  })
})
