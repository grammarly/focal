import { Lens, Prism, PropExpr } from './../lens'
import { Option } from './../utils'
import { structEq } from './../equals'

import { Observable, Subscriber, Subscription, BehaviorSubject, combineLatest } from 'rxjs'

/**
 * Read-only atom.
 *
 * @template T type of atom values
 */
export interface ReadOnlyAtom<T> extends Observable<T> {
  /**
   * Get the current atom value.
   *
   * @example
   * import { Atom } from '@grammarly/focal'
   *
   * const a = Atom.create(5)
   * a.get()
   * // => 5
   *
   * a.set(6)
   * a.get()
   * // => 6
   * @returns current value
   */
  get(): T

  /**
   * View this atom as is.
   * Doesn't seem to make sense, but it is needed to be used from
   * inheriting atom classes to conveniently go from read/write to
   * read-only atom.
   *
   * @example
   * import { Atom } from '@grammarly/focal'
   *
   * const source = Atom.create(5)
   * const view = source.view()
   *
   * view.get()
   * // => 5
   *
   * source.set(6)
   * view.get()
   * // => 6
   *
   * view.set(7) // compilation error
   * @returns this atom
   */
  view(): ReadOnlyAtom<T>

  /**
   * View this atom through a given mapping.
   *
   * @example
   * import { Atom } from '@grammarly/focal'
   *
   * const a = Atom.create(5)
   * const b = a.view(x => x * 2)
   *
   * a.get()
   * // => 5
   * b.get()
   * // => 10
   *
   * a.set(10)
   *
   * a.get()
   * // => 10
   * b.get()
   * // => 20
   * @param getter getter function that defines the view
   * @returns atom viewed through the given transformation
   */
  view<U>(getter: (x: T) => U): ReadOnlyAtom<U>

  /**
   * View this atom through a given lens.
   *
   * @param lens lens that defines the view
   * @returns atom viewed through the given transformation
   */
  view<U>(lens: Lens<T, U>): ReadOnlyAtom<U>

  /**
   * View this atom through a given prism.
   *
   * @param prism prism that defines the view
   * @returns atom viewed through the given transformation
   */
  view<U>(prism: Prism<T, U>): ReadOnlyAtom<Option<U>>

  /**
   * View this atom at a property of given name.
   */
  view<K extends keyof T>(k: K): ReadOnlyAtom<T[K]>

  /**
   * View this atom at a give property path.
   */
  view<
    K1 extends keyof T,
    K2 extends keyof T[K1]
  >(k1: K1, k2: K2): ReadOnlyAtom<T[K1][K2]>

  /**
   * View this atom at a give property path.
   */
  view<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
  >(k1: K1, k2: K2, k3: K3): ReadOnlyAtom<T[K1][K2][K3]>

  /**
   * View this atom at a give property path.
   */
  view<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3]
  >(k1: K1, k2: K2, k3: K3, k4: K4): ReadOnlyAtom<T[K1][K2][K3][K4]>

  /**
   * View this atom at a give property path.
   */
  view<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4]
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): ReadOnlyAtom<T[K1][K2][K3][K4][K5]>
}

/**
 * A read/write atom.
 *
 * @template T type of atom values
 */
export interface Atom<T> extends ReadOnlyAtom<T> {
  /**
   * Modify atom value.
   *
   * The update function should be:
   * - referentially transparent: return same result for same arguments
   * - side-effect free: don't perform any mutations (including calling
   * Atom.set/Atom.modify) and side effects
   *
   * @param updateFn value update function
   */
  modify(updateFn: (currentValue: T) => T): void

  /**
   * Set new atom value.
   *
   * @param newValue new value
   */
  set(newValue: T): void

  /**
   * DEPRECATED: please use other overloads instead!
   *
   * Create a lensed atom using a property expression, which specifies
   * a path inside the atom value's data structure.
   *
   * The property expression is a limited form of a getter,
   * with following restrictions:
   * - should be a pure function
   * - should be a single-expression function (i.e. return immediately)
   * - should only access object properties (nested access is OK)
   * - should not access array items
   *
   * @example
   * const atom = Atom.create({ a: { b: 5 } })
   *
   * atom.lens(x => x.a.b).modify(x => x + 1)
   * atom.get()
   * // => { a: { b: 6 } }
   * @template U destination value type
   * @param propExpr property expression
   * @returns a lensed atom
   */
  lens<U>(propExpr: PropExpr<T, U>): Atom<U>

  /**
   * Create a lensed atom by supplying a lens.
   *
   * @template U destination value type
   * @param lens a lens
   * @returns a lensed atom
   */
  lens<U>(lens: Lens<T, U>): Atom<U>

  /**
   * Create a lensed atom that's focused on a property of given name.
   */
  lens<K extends keyof T>(k: K): Atom<T[K]>

  /**
   * Create a lensed atom that's focused on a given property path.
   */
  lens<
    K1 extends keyof T,
    K2 extends keyof T[K1]
  >(k1: K1, k2: K2): Atom<T[K1][K2]>

  /**
   * Create a lensed atom that's focused on a given property path.
   */
  lens<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
  >(k1: K1, k2: K2, k3: K3): Atom<T[K1][K2][K3]>

  /**
   * Create a lensed atom that's focused on a given property path.
   */
  lens<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3]
  >(k1: K1, k2: K2, k3: K3, k4: K4): Atom<T[K1][K2][K3][K4]>

  /**
   * Create a lensed atom that's focused on a given property path.
   */
  lens<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4]
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): Atom<T[K1][K2][K3][K4][K5]>
}

export abstract class AbstractReadOnlyAtom<T>
    extends BehaviorSubject<T>
    implements ReadOnlyAtom<T> {
  abstract get(): T

  view(): ReadOnlyAtom<T>
  view<U>(getter: (x: T) => U): ReadOnlyAtom<U>
  view<U>(lens: Lens<T, U>): ReadOnlyAtom<U>
  view<U>(prism: Prism<T, U>): ReadOnlyAtom<Option<U>>
  view<K extends keyof T>(k: K): ReadOnlyAtom<T[K]>

  view<U>(...args: any[]): ReadOnlyAtom<any> {
    /* eslint-disable @typescript-eslint/no-use-before-define */
    return args[0] !== undefined
      // view(getter) case
      ? typeof args[0] === 'function'
        ? new AtomViewImpl<T, U>(this, args[0] as (x: T) => U)
        // view('key') case
        : typeof args[0] === 'string'
          ? new AtomViewImpl<T, U>(this, Lens.compose<T, U>(...args.map(Lens.key())).get)
          // view(lens) and view(prism) cases
          // @NOTE single case handles both lens and prism arg
          : new AtomViewImpl<T, U>(this, x => (args[0] as Lens<T, U>).get(x))
      // view() case
      : this as ReadOnlyAtom<T>
    /* eslint-enable @typescript-eslint/no-use-before-define */
  }
}

export abstract class AbstractAtom<T>
    extends AbstractReadOnlyAtom<T>
    implements Atom<T> {
  abstract modify(updateFn: (x: T) => T): void

  set(x: T) {
    this.modify(() => x)
  }

  lens<U>(propExpr: PropExpr<T, U>): Atom<U>
  lens<U>(lens: Lens<T, U>): Atom<U>
  lens<K extends keyof T>(k: K): Atom<T[K]>

  lens<U>(arg1: Lens<T, U> | PropExpr<T, U> | string, ...args: string[]): Atom<any> {

    /* eslint-disable @typescript-eslint/no-use-before-define */
    // lens(prop expr) case
    return typeof arg1 === 'function'
      ? new LensedAtom<T, U>(this, Lens.prop(arg1 as (x: T) => U), structEq)
      // lens('key') case
      : typeof arg1 === 'string'
        ? new LensedAtom(
          this, Lens.compose(Lens.key(arg1), ...args.map(k => Lens.key(k))), structEq)
        // lens(lens) case
        : new LensedAtom<T, U>(this, arg1 as Lens<T, U>, structEq)
    /* eslint-enable @typescript-eslint/no-use-before-define */
  }
}

export class JsonAtom<T> extends AbstractAtom<T> {
  constructor(initialValue: T) {
    super(initialValue)
  }

  get() {
    return this.getValue()
  }

  modify(updateFn: (x: T) => T) {
    const prevValue = this.getValue()
    const next = updateFn(prevValue)

    if (!structEq(prevValue, next))
      this.next(next)
  }

  set(x: T) {
    const prevValue = this.getValue()

    if (!structEq(prevValue, x))
      this.next(x)
  }
}

class LensedAtom<TSource, TDest> extends AbstractAtom<TDest> {
  constructor(
    private _source: Atom<TSource>,
    private _lens: Lens<TSource, TDest>,
    private _eq: (x: TDest, y: TDest) => boolean = structEq
  ) {
    // @NOTE this is a major hack to optimize for not calling
    // _lens.get the extra time here. This makes the underlying
    // BehaviorSubject to have an `undefined` for it's current value.
    //
    // But it works because before somebody subscribes to this
    // atom, it will subscribe to the _source (which we expect to be a
    // descendant of BehaviorSubject as well), which will emit a
    // value right away, triggering our _onSourceValue.
    super(undefined!)
  }

  get() {
    // Optimization: in case we're already subscribed to the
    // source atom, the BehaviorSubject.getValue will return
    // an up-to-date computed lens value.
    //
    // This way we don't need to recalculate the lens value
    // every time.
    return this._subscription
      ? this.getValue()
      : this._lens.get(this._source.get())
  }

  modify(updateFn: (x: TDest) => TDest) {
    this._source.modify(x => this._lens.modify(updateFn, x))
  }

  set(newValue: TDest) {
    this._source.modify(x => this._lens.set(newValue, x))
  }

  private _onSourceValue(x: TSource) {
    const prevValue = this.getValue()
    const next = this._lens.get(x)

    if (!this._eq(prevValue, next))
      this.next(next)
  }

  private _subscription: Subscription | null = null
  private _refCount = 0

  // Rx method overrides
  _subscribe(subscriber: Subscriber<TDest>) {
    if (!this._subscription) {
      this._subscription = this._source.subscribe(x => this._onSourceValue(x))
    }
    this._refCount++

    const sub = new Subscription(() => {
      if (--this._refCount <= 0 && this._subscription) {
        this._subscription.unsubscribe()
        this._subscription = null
      }
    })
    sub.add(super._subscribe(subscriber))

    return sub
  }

  unsubscribe() {
    if (this._subscription) {
      this._subscription.unsubscribe()
      this._subscription = null
    }
    this._refCount = 0

    super.unsubscribe()
  }
}

class AtomViewImpl<TSource, TDest> extends AbstractReadOnlyAtom<TDest> {
  constructor(
    private _source: ReadOnlyAtom<TSource>,
    private _getter: (x: TSource) => TDest,
    private _eq: (x: TDest, y: TDest) => boolean = structEq
  ) {
    // @NOTE this is a major hack to optimize for not calling
    // _getter the extra time here. This makes the underlying
    // BehaviorSubject to have an `undefined` for it's current value.
    //
    // But it works because before somebody subscribes to this
    // atom, it will subscribe to the _source (which we expect to be a
    // descendant of BehaviorSubject as well), which will emit a
    // value right away, triggering our _onSourceValue.
    super(undefined!)
  }

  get() {
    // Optimization: in case we're already subscribed to the
    // source atom, the BehaviorSubject.getValue will return
    // an up-to-date computed lens value.
    //
    // This way we don't need to recalculate the view value
    // every time.
    return this._subscription
      ? this.getValue()
      : this._getter(this._source.get())
  }

  private _onSourceValue(x: TSource) {
    const prevValue = this.getValue()
    const next = this._getter(x)

    if (!this._eq(prevValue, next))
      this.next(next)
  }

  private _subscription: Subscription | null = null
  private _refCount = 0

  // Rx method overrides
  _subscribe(subscriber: Subscriber<TDest>) {
    if (!this._subscription) {
      this._subscription = this._source.subscribe(x => this._onSourceValue(x))
    }
    this._refCount++

    const sub = new Subscription(() => {
      if (--this._refCount <= 0 && this._subscription) {
        this._subscription.unsubscribe()
        this._subscription = null
      }
    })
    sub.add(super._subscribe(subscriber))

    return sub
  }

  unsubscribe() {
    if (this._subscription) {
      this._subscription.unsubscribe()
      this._subscription = null
    }
    this._refCount = 0

    super.unsubscribe()
  }
}

export class CombinedAtomViewImpl<TResult> extends AbstractReadOnlyAtom<TResult> {
  constructor(
    private _sources: ReadOnlyAtom<any>[],
    private _combineFn: (xs: any[]) => TResult,
    private _eq: (x: TResult, y: TResult) => boolean = structEq
  ) {
    // @NOTE this is a major hack to optimize for not calling
    // _combineFn and .get for each source the extra time here.
    // This makes the underlying BehaviorSubject to have an
    // `undefined` for it's current value.
    //
    // But it works because before somebody subscribes to this
    // atom, it will subscribe to the _source (which we expect to be a
    // descendant of BehaviorSubject as well), which will emit a
    // value right away, triggering our _onSourceValue.
    super(undefined!)
  }

  get() {
    // Optimization: in case we're already subscribed to
    // source atoms, the BehaviorSubject.getValue will return
    // an up-to-date computed view value.
    //
    // This way we don't need to recalculate the view value
    // every time.
    return this._subscription
      ? this.getValue()
      : this._combineFn(this._sources.map(x => x.get()))
  }

  private _onSourceValues(xs: any[]) {
    const prevValue = this.getValue()
    const next = this._combineFn(xs)

    if (!this._eq(prevValue, next))
      this.next(next)
  }

  private _subscription: Subscription | null = null
  private _refCount = 0

  // Rx method overrides
  _subscribe(subscriber: Subscriber<TResult>) {
    if (!this._subscription) {
      this._subscription = combineLatest(this._sources)
        .subscribe(xs => this._onSourceValues(xs))
    }
    this._refCount++

    const sub = new Subscription(() => {
      if (--this._refCount <= 0 && this._subscription) {
        this._subscription.unsubscribe()
        this._subscription = null
      }
    })
    sub.add(super._subscribe(subscriber))

    return sub
  }

  unsubscribe() {
    if (this._subscription) {
      this._subscription.unsubscribe()
      this._subscription = null
    }
    this._refCount = 0

    super.unsubscribe()
  }
}
