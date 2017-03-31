import { Lens, Prism, PropExpr } from './../lens'
import { structEq, Option } from './../utils'

// @TODO importing the whole RxJS here. there is a way to
// only import operators/types that are used to reduce the
// resulting bundle size, but I couldn't make it work.
import {
  Observable, Subscriber, Subscription, BehaviorSubject
} from 'rxjs/Rx'

// tslint:disable no-unused-vars
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
   * // => 6
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
   * View this atom through a lens.
   *
   * @param lens lens that defines the view
   * @returns atom viewed through the given transformation
   */
  view<U>(lens: Lens<T, U>): ReadOnlyAtom<U>
  view<U>(prism: Prism<T, U>): ReadOnlyAtom<Option<U>>
}
// tslint:enable no-unused-vars

// tslint:disable no-unused-vars
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
   *   Atom.set/Atom.modify) and side effects
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
   * Lens into this atom. The argument is a property expression, which
   * is a limited form of a getter, with following restrictions:
   * - should be a pure function
   * - should be a single-expression function (i.e. return immediately)
   * - should only access object properties (nested access is OK)
   *
   * @example
   * const atom = Atom.create({ a: { b: 5 } })
   *
   * atom.lens(x => x.a.b).modify(x => x + 1)
   * atom.get()
   * // => { a: { b: 6 } }
   * @template U destination value type
   * @param propExpr property expression
   * @returns lensed atom
   */
  lens<U>(propExpr: PropExpr<T, U>): Atom<U>

  /**
   * Lens into this atom.
   *
   * @template U destination value type
   * @param lens a lens
   * @returns lensed atom
   */
  lens<U>(lens: Lens<T, U>): Atom<U>
}
// tslint:enable no-unused-vars

export abstract class AbstractReadOnlyAtom<T>
    extends BehaviorSubject<T>
    implements ReadOnlyAtom<T> {
  abstract get(): T;

  // tslint:disable no-unused-vars
  view(): ReadOnlyAtom<T>;
  view<U>(getter: (x: T) => U): ReadOnlyAtom<U>
  view<U>(lens: Lens<T, U>): ReadOnlyAtom<U>
  view<U>(prism: Prism<T, U>): ReadOnlyAtom<Option<U>>
  // tslint:enable no-unused-vars

  view<U>(
    arg?: ((x: T) => U) | Lens<T, U> | Prism<T, U>
  ): ReadOnlyAtom<U> | ReadOnlyAtom<Option<U>> | ReadOnlyAtom<T> {
    return arg
      ? typeof arg === 'function'
        // handle view(getter) case
        ? new AtomViewImpl<T, U>(this, arg as (x: T) => U)
        // handle view(lens) and view(prism) cases
        // @NOTE single case handles both lens and prism arg
        : new AtomViewImpl<T, U>(this, x => (arg as Lens<T, U>).get(x))
      // handle view() case
      : this as ReadOnlyAtom<T>
  }
}

export abstract class AbstractAtom<T>
    extends AbstractReadOnlyAtom<T>
    implements Atom<T> {
  abstract modify(updateFn: (x: T) => T): void

  set(x: T) {
    this.modify(() => x)
  }

  // tslint:disable no-unused-vars
  lens<U>(propExpr: PropExpr<T, U>): Atom<U>
  lens<U>(lens: Lens<T, U>): Atom<U>
  // tslint:enable no-unused-vars

  lens<U>(arg: Lens<T, U> | PropExpr<T, U>): Atom<U> {
    return typeof arg === 'function'
      // handle lens(prop expr) case
      ? new LensedAtom<T, U>(
        this, Lens.prop(arg as (x: T) => U), structEq)
      // handle lens(lens) case
      : new LensedAtom<T, U>(this, arg as Lens<T, U>, structEq)
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

  private __onSourceValue: ((x: TSource) => void) | undefined = undefined
  private _subscription: Subscription | null = null

  // Rx method overrides
  _subscribe(subscriber: Subscriber<TDest>) { // tslint:disable-line function-name
    if (!this._subscription) {
      this.__onSourceValue = (value: TSource) => this._onSourceValue(value)
      this._subscription = this._source.subscribe(this.__onSourceValue)
    }

    return super._subscribe(subscriber)
  }

  unsubscribe() {
    if (this._subscription) this._subscription.unsubscribe()
    this.__onSourceValue = undefined
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

  private __onSourceValue: ((x: TSource) => void) | undefined = undefined
  private _subscription: Subscription | null = null

  // Rx method overrides
  _subscribe(subscriber: Subscriber<TDest>) { // tslint:disable-line function-name
    if (!this._subscription) {
      this.__onSourceValue = (value: TSource) => this._onSourceValue(value)
      this._subscription = this._source.subscribe(this.__onSourceValue)
    }

    return super._subscribe(subscriber)
  }

  unsubscribe() {
    if (this._subscription) this._subscription.unsubscribe()
    this.__onSourceValue = undefined
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

  private __onSourceValues: ((xs: any[]) => void) | undefined = undefined
  private _subscription: Subscription | null = null

  // Rx method overrides
  _subscribe(subscriber: Subscriber<TResult>) { // tslint:disable-line function-name
    if (!this._subscription) {
      this.__onSourceValues = (values: any[]) => this._onSourceValues(values)
      this._subscription =
        Observable.combineLatest(this._sources)
          .subscribe(this.__onSourceValues)
    }

    return super._subscribe(subscriber)
  }

  unsubscribe() {
    if (this._subscription) this._subscription.unsubscribe()
    this.__onSourceValues = undefined
    super.unsubscribe()
  }
}
