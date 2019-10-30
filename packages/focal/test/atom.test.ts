// tslint:disable no-unnecessary-local-variable
import { merge, Observable, from, Subject, never, throwError, empty } from 'rxjs'
import { take, toArray, tap, materialize, map } from 'rxjs/operators'
import { Atom, Lens, ReadOnlyAtom } from '../src'
import { structEq } from '../src/utils'

function testAtom(newAtom: (x: number) => Atom<number>) {
  it('atom/basic', async () => {
    const a = newAtom(1)
    let expected = 1

    const cb = (x: number) => {
      // expected new value
      expect(x).toEqual(expected)

      // expected current value
      expect(a.get()).toEqual(expected)
    }

    const subscription = a.subscribe(cb)

    // get initial value
    expect(a.get()).toEqual(1)

    expected = 2
    a.modify(x => x + 1)

    expected = 500
    a.set(500)

    subscription.unsubscribe()
  })

  it('atom/observable: distinct values', () => {
    const a = newAtom(1)
    const observations: number[] = []
    const cb = (x: number) => observations.push(x)
    const subscription = a.subscribe(cb)

    ; [2, 3, 3, 3, 1].forEach(x => a.set(x))

    expect(structEq(observations, [1, 2, 3, 1])).toBeTruthy()

    subscription.unsubscribe()
  })
}

function testDerivedAtom(
  createDerived: (
    a: Atom<number>,
    f: (x: number) => number,
    onCalled: (a: number) => void
  ) => ReadOnlyAtom<number>,
  create: (x: number) => Atom<number> = Atom.create
) {
  describe('unsub in modify', () => {
    const a = create(5)

    const viewFnCalls: number[] = []
    const os: number[] = []

    const v = createDerived(a, x => x + 1, x => viewFnCalls.push(x))

    expect(viewFnCalls).toEqual([])
    expect(os).toEqual([])

    const sub = v.subscribe(x => {
      os.push(x)
    })
    expect(viewFnCalls).toEqual([5])
    expect(os).toEqual([6])

    a.modify(x => x + 1)
    expect(viewFnCalls).toEqual([5, 6])
    expect(os).toEqual([6, 7])

    a.modify(x => {
      sub.unsubscribe()
      return 0
    })
    expect(viewFnCalls).toEqual([5, 6])
    expect(os).toEqual([6, 7])
  })

  describe('two atoms subscriptions', () => {
    const a = create(5)

    const viewFnCalls1: number[] = []
    const os1: number[] = []
    const viewFnCalls2: number[] = []
    const os2: number[] = []

    const v1 = createDerived(a, x => x + 1, x => viewFnCalls1.push(x))
    const v2 = v1.view(x => {
      viewFnCalls2.push(x)
      return x + 5
    })

    expect(viewFnCalls1).toEqual([])
    expect(viewFnCalls2).toEqual([])

    const sub1 = v1.subscribe(x => os1.push(x))

    v2.subscribe(x => os2.push(x))

    expect(viewFnCalls1).toEqual([5])
    expect(viewFnCalls2).toEqual([6])
    expect(os2).toEqual([11])

    a.modify(x => x + 1)
    expect(viewFnCalls1).toEqual([5, 6])
    expect(viewFnCalls2).toEqual([6, 7])
    expect(os2).toEqual([11, 12])

    a.modify(x => {
      sub1.unsubscribe()
      return 0
    })

    expect(viewFnCalls1).toEqual([5, 6, 0])
    expect(viewFnCalls2).toEqual([6, 7, 1])
    expect(os1).toEqual([6, 7])
    expect(os2).toEqual([11, 12, 6])
  })

  describe('resubscribe', () => {
    const a = create(5)
    const v = createDerived(a, x => x + 1, () => { /* no-op */ })

    const os: number[] = []
    const sub1 = v.subscribe(x => os.push(x))

    // immediate observation on subscription
    expect(os).toEqual([6])

    a.modify(x => x + 1)

    // observation on modify
    expect(os).toEqual([6, 7])

    sub1.unsubscribe()

    a.modify(x => x + 1)

    // no observation after unsubscription
    expect(os).toEqual([6, 7])

    const sub2 = v.subscribe(x => os.push(x))

    // immediate observation on subscription 2
    expect(os).toEqual([6, 7, 8])

    a.modify(x => x + 1)

    // observation on modify 2
    expect(os).toEqual([6, 7, 8, 9])

    sub2.unsubscribe()

    a.modify(x => x + 1)

    // no observation after unsubscription 2
    expect(os).toEqual([6, 7, 8, 9])
  })

  describe('multiple subscriptions', () => {
    const a = create(5)
    const v = createDerived(a, x => x + 1, () => { /* no-op */ })

    const os1: number[] = []
    const sub1 = v.subscribe(x => os1.push(x))

    const os2: number[] = []
    const sub2 = v.subscribe(x => os2.push(x))

    // same initial observations upon subscription
    expect(os1).toEqual(os2)

    a.set(6)

    // same observations on modify
    expect(os1).toEqual(os2)

    sub1.unsubscribe()
    a.set(7)

    // no modify observation after unsub 1
    expect(os1).toEqual([6, 7])

    // observation on 2 after unsub on 1
    expect(os2).toEqual([6, 7, 8])

    sub2.unsubscribe()
    a.set(8)

    // no more observations
    expect(os1).toEqual([6, 7])

    // no more observations on 2
    expect(os2).toEqual([6, 7, 8])
  })
}

describe('atom', () => {
  describe('plain', () => {
    testAtom(x => Atom.create(x))
  })

  describe('lens', () => {
    describe('lensed, property expression', () => {
      testAtom(x => {
        const source = Atom.create({ a: x })
        const lensed = source.lens(x => x.a)
        return lensed
      })
    })

    describe('lensed, nested property expression', () => {
      testAtom(x => {
        const source = Atom.create({ a: { b: { c: x } } })
        const lensed = source.lens(x => x.a.b.c)
        return lensed
      })
    })

    describe('lensed, chained lenses', () => {
      testAtom(x => {
        const source = Atom.create({ a: { b: { c: x } } })
        const lensed = source.lens(x => x.a).lens(x => x.b).lens(x => x.c)
        return lensed
      })
    })

    describe('lensed, nested safe key', () => {
      testAtom(x => {
        const source = Atom.create({ a: { b: { c: x } } })
        const lensed = source.lens('a', 'b', 'c')
        return lensed
      })
    })

    describe('lensed, safe key, chained lenses', () => {
      testAtom(x => {
        const source = Atom.create({ a: { b: { c: x } } })
        const lensed = source.lens('a').lens('b').lens('c')
        return lensed
      })
    })

    describe('lensed, chained + complex', () => {
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

      expect(lensed.get()).toEqual(6)

      lensed.set(6)

      expect(lensed.get()).toEqual(6)
    })

    describe('lensed, safe key, chained + complex', () => {
      const source = Atom.create({ a: { b: { c: 5 } } })
      const lensed =
        source
          .lens('a').lens('b').lens('c')
          .lens(
            Lens.create(
              (x: number) => x + 1,
              (v: number, _: number) => v - 1))

      expect(lensed.get()).toEqual(6)

      lensed.set(6)

      expect(lensed.get()).toEqual(6)
    })

    describe('lens then view', () => {
      const x1 = Atom.create({ a: { b: 5 } })
      const x2 = x1.lens(x => x.a).view(x => x.b).view(x => x + 1)
      const x3 = x1.lens(x => x.a).lens(x => x.b)

      expect(x3.get()).toEqual(5)
      expect(x2.get()).toEqual(6)

      x3.set(6)

      expect(x3.get()).toEqual(6)
      expect(x2.get()).toEqual(7)
      expect(structEq({ a: { b: 6 } }, x1.get())).toBeTruthy()
    })

    describe('index lens', () => {
      describe('generic', () => {
        testAtom(x => {
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

      describe('atom interface', () => {
        const source = Atom.create([1, 2, 3])
        const first = source.lens(Lens.index<number>(0))

        // initial value
        expect(first.get()).toEqual(1)

        first.set(10)

        // set through lens
        expect(first.get()).toEqual(10)

        // propagates to source
        expect(structEq(source.get(), [10, 2, 3])).toBeTruthy()

        source.set([100, 2, 3])

        // set through source
        expect(first.get()).toEqual(100)

        source.set([2, 3])

        // get after element removed
        expect(first.get()).toEqual(2)
      })

      describe('observing lensed', () => {
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

        expect(observations).toEqual([1, 10, 100, 2, 1000])

        subscription.unsubscribe()
      })
    })

    testDerivedAtom(
      (a, f, onCalled) => a.lens(
        Lens.create(
          (x: number) => {
            onCalled(x)
            return f(x)
          },
          (v, _) => v
        )
      )
    )
  })

  describe('view', () => {
    describe('readonly, getter, simple', () => {
      const source = Atom.create(5)
      const view = source.view(x => x + 1)

      expect(source.get()).toEqual(5)
      expect(view.get()).toEqual(6)

      source.modify(x => x + 1)

      expect(source.get()).toEqual(6)
      expect(view.get()).toEqual(7)
    })

    describe('readonly, safe key, simple', () => {
      const source = Atom.create({ a: 5 })
      const view = source.view('a')

      expect(view.get()).toEqual(5)

      source.modify(x => ({ a: x.a + 1 }))

      expect(view.get()).toEqual(6)
    })

    describe('readonly, safe key, complex', () => {
      const source = Atom.create({ a: { b: { c: 5 } } })
      const view = source.view('a', 'b', 'c')

      expect(view.get()).toEqual(5)

      source.modify(x => ({ a: { b: { c: x.a.b.c + 1 } } }))

      expect(view.get()).toEqual(6)
    })

    describe('observable semantics: distinct values', () => {
      const source = Atom.create(1)
      const view = source.view(x => x + 1)

      const sourceOs: number[] = []
      const sourceSub = source.subscribe(x => sourceOs.push(x))

      const viewOs: number[] = []
      const viewSub = view.subscribe(x => viewOs.push(x))

      ; [2, 2, 2, 3, 3, 3, 1, 1, 1].forEach(x => source.set(x))

      expect(viewOs).toEqual([2, 3, 4, 2])
      expect(sourceOs).toEqual([1, 2, 3, 1])

      sourceSub.unsubscribe()
      viewSub.unsubscribe()
    })

    testDerivedAtom((a, f, onCalled) => a.view(x => {
      onCalled(x)
      return f(x)
    }))

    describe('complex expression', () => {
      const source = Atom.create({ a: { b: { c: 5 } } })
      const lensed = source.lens(x => x.a.b.c)
      const view = lensed.view(x => x + 5 > 0)

      expect(view.get()).toEqual(true)

      lensed.set(6)
      expect(view.get()).toEqual(true)

      lensed.set(-5)
      expect(view.get()).toEqual(false)
    })
  })

  describe('atom value caching', () => {
    describe('static', () => {
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
        expect([called1, called2, called3, called4]).toEqual([a, b, c, d])
      }

      source.set(0)
      testCalls(0, 0, 0, 0)

      expect(a3.get()).toEqual('Hi -1')
      testCalls(1, 1, 1, 0)

      expect(a4.get()).toEqual('Ho -1')
      testCalls(2, 2, 1, 1)

      source.set(1)
      testCalls(2, 2, 1, 1)
    })

    describe('subscribed', () => {
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
        expect(
          [called1, called2, called3, called4, called5, called5]).toEqual(
          [a, b, c, d, e, f])
        //   ,
        //   msg
        // )
      }

      const test = merge(a4, a5, a6)
      testCalls(0, 0, 0, 0, 0, 0, 'no calls initially')

      const observations: string[] = []
      const sub = test.subscribe(x => observations.push(x))
      testCalls(1, 1, 1, 1, 1, 1, 'one call each on subscribe (initial emit)')

      source.set(1)
      testCalls(2, 2, 2, 2, 2, 2, 'two calls each after subscribe + 1 set')

      source.set(2)
      testCalls(3, 3, 3, 3, 3, 3, '3 calls each after subscribe + 2 sets')

      expect(
        observations
      ).toEqual(
        [
          'Hi -2', 'Ho -2', 'HU -2',
          'Hi -4', 'Ho -4', 'HU -4',
          'Hi -6', 'Ho -6', 'HU -6'
        ]
      )

      sub.unsubscribe()
    })

    describe('with Atom.combine/static', () => {
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
        // @TODO jest doesn't have messages for expects
        _msg: string
      ) {
        expect(
          [called1, called2, called3, called4, called5, called5]
        ).toEqual(
          [a, b, c, d, e, f]
        )
      }

      testCalls(0, 0, 0, 0, 0, 0, 'no calls initially')

      const combined = Atom.combine(a4, a5, a6, (x, y, z) => [x, y, z])
      testCalls(0, 0, 0, 0, 0, 0, 'no calls after creating Atom.combined')

      expect(combined.get()).toEqual(['Hi -2', 'Ho -2', 'HU -2'])

      // it's ok to have 3 calls here each as until we are subscribed to this
      // atom it doesn't track its sources
      testCalls(3, 3, 3, 1, 1, 1, '3 + 1 call after .get()')

      source.set(1)
      testCalls(3, 3, 3, 1, 1, 1, 'no new calls after source .set()')

      expect(a4.get()).toEqual('Hi -4')
      testCalls(4, 4, 4, 2, 1, 1, 'calls after .get() on intermediate node')
    })
  })

  describe('combine', () => {
    describe('constant', () => {
      const combined = Atom.combine(
        Atom.create(1), Atom.create(false), Atom.create('test'),
        (x, y, z) => y && x < 0 ? z.toUpperCase() : 'NO'
      )

      expect(combined.get()).toEqual('NO')
    })

    describe('dynamic, unsubscribed', () => {
      const s1 = Atom.create(1)
      const s2 = Atom.create(false)
      const s3 = Atom.create('test')

      const combined = Atom.combine(
        s1, s2, s3,
        (x, y, z) => y && x < 0 ? z.toUpperCase() : 'NO'
      )

      expect(combined.get()).toEqual('NO')

      s1.set(-1)
      expect(combined.get()).toEqual('NO')

      s2.set(true)
      expect(combined.get()).toEqual('TEST')

      s3.set('heLLo')
      expect(combined.get()).toEqual('HELLO')

      s1.set(100)
      expect(combined.get()).toEqual('NO')
    })

    describe('dynamic, subscribed', () => {
      const s1 = Atom.create(1)
      const s2 = Atom.create(false)
      const s3 = Atom.create('test')
      const observations: string[] = []

      const combined = Atom.combine(
        s1, s2, s3,
        (x, y, z) => y && x < 0 ? z.toUpperCase() : 'NO'
      )

      const sub = combined.subscribe(x => observations.push(x))

      expect(combined.get()).toEqual('NO')

      s1.set(-1)
      expect(combined.get()).toEqual('NO')

      s2.set(true)
      expect(combined.get()).toEqual('TEST')

      s3.set('heLLo')
      expect(combined.get()).toEqual('HELLO')

      s1.set(100)
      expect(combined.get()).toEqual('NO')

      expect(observations).toEqual(['NO', 'TEST', 'HELLO', 'NO'])

      sub.unsubscribe()
    })

    testDerivedAtom((a, f, onCalled) => Atom.combine(a, Atom.create(0), (a, b) => {
      onCalled(a)
      return f(a)
    }))
  })

  describe('logger', () => {
    let consoleLogFireTime = 0

    const atom = Atom.create('bar')
    const consoleLogArguments: string[][] = []
    const logAtom = Atom.log(atom, (prevState: string, newState: string) => {
      consoleLogFireTime++
      consoleLogArguments.push([prevState, newState])
    })
    logAtom.set('foo')

    expect(consoleLogFireTime).toEqual(2)
    expect(consoleLogArguments).toEqual([['bar', 'bar'], ['bar', 'foo']])
  })

  describe('fromObservable', () => {
    test('emits atom', async () => {
      const a = await Atom.fromObservable(from([1])).pipe(take(1)).toPromise()
      expect(a.get()).toEqual(1)
    })

    test('emits atom once', async () => {
      const a = await merge(
        Atom.fromObservable(
          from(Array.from(new Array(15)).map(_ => Math.random()))
        ),
        from(['hello'])
      ).pipe(take(2), toArray()).toPromise()

      expect(a[1]).toEqual('hello')
    })

    test('does not subscribe to source immediately', () => {
      let subscribed = false

      const src = new Observable(o => {
        subscribed = true
        o.complete()

        return () => { subscribed = false }
      })

      const _ = Atom.fromObservable(src)

      expect(subscribed).toEqual(false)
    })

    test('one sub max, unsub when not in use', async () => {
      let subCount = 0

      const src = new Observable<number>(o => {
        subCount++
        o.next(1)

        return () => { subCount-- }
      })

      const a = Atom.fromObservable(src)

      // no subs until we have subscribed to use the atom
      expect(subCount).toEqual(0)

      const subs = Array.from(new Array(5)).map(_ => a.subscribe(a => {
        expect(a.get()).toEqual(1)
      }))

      // exactly one sub, no matter how many times the atom observable was subbed to
      expect(subCount).toEqual(1)

      subs.forEach(s => s.unsubscribe())

      // no subs to source when unused
      expect(subCount).toEqual(0)
    })

    test('does not return atom if source has no value', async () => {
      const r = await merge(
        Atom.fromObservable(never()),
        from(['hello'])
      ).pipe(take(1), toArray()).toPromise()

      expect(r).toEqual(['hello'])
    })

    test('atom values correspond to source', async () => {
      const src = new Subject<number>()

      const r = Atom.fromObservable(src).pipe(
        tap(async a => {
          const srcValues = Array.from(new Array(10), _ => Math.random())
          const atomValues = a.pipe(toArray()).toPromise()

          srcValues.forEach(x => {
            src.next(x)
            expect(a.get()).toEqual(x)
          })

          expect(await atomValues).toEqual(srcValues)
        }),
        take(1)
      ).toPromise()

      src.next(0)
      await r
    })

    test('atom values not updated after unsubscribed from result', async () => {
      const src = new Subject<number>()
      let atom!: ReadOnlyAtom<number>

      const sub = Atom.fromObservable(src).pipe(
        tap(a => {
          atom = a
        })
      ).subscribe()

      src.next(1)
      expect(atom.get()).toEqual(1)
      src.next(2)
      expect(atom.get()).toEqual(2)

      sub.unsubscribe()

      src.next(5)
      expect(atom.get()).toEqual(2)
    })

    test('source error is propagated', async () => {
      try {
        await (Atom.fromObservable(throwError('hello')).toPromise())
        fail()
      } catch (e) {
        expect(e).toEqual('hello')
      }
    })

    test('source completion is propagated 1', async () => {
      expect(
        await Atom.fromObservable(empty()).pipe(
          materialize(), map(x => x.kind), toArray()
        ).toPromise()
      ).toEqual(['C'])
    })
  })
})
