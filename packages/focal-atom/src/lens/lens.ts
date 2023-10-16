import { Lens, Prism, createModify } from './base'
import { create as createPrism } from './prism'

export { key, prop, index, withDefault, replace, find } from './json'

/**
 * Create a lens.
 *
 * @export
 * @template O type of the source
 * @template P type of the destination
 * @param getter a getter function
 * @param setter a setter function
 * @returns a lens that operates by given getter and setter
 */
export function create<TSource, T>(
  getter: (s: TSource) => T,
  setter: (v: T, s: TSource) => TSource
): Lens<TSource, T> {
  return {
    get: getter,
    set: setter,
    modify: createModify(getter, setter),

    compose<U>(next: Lens<T, U>): Lens<TSource, U> {
      return create(
        (s: TSource) => next.get(getter(s)),
        (v: U, s: TSource) => setter(next.set(v, getter(s)), s)
      )
    }
  }
}

/**
 * Compose several lenses, where each subsequent lens' state type is the previous
 * lens' output type.
 *
 * You need to explicitly say what will be the type of resulting lens, and you
 * need to do it right as there are no guarantees at compile time.
 *
 * @static
 * @template S the resulting lens' state
 * @template A the resulting lens' output
 */
export function compose<T, U>(l: Lens<T, U>): Lens<T, U>

export function compose<T1, T2, U>(l1: Lens<T1, T2>, l2: Lens<T2, U>): Lens<T1, U>

export function compose<T1, T2, T3, U>(
  l1: Lens<T1, T2>, l2: Lens<T2, T3>, l3: Lens<T3, U>
): Lens<T1, U>

export function compose<T1, T2, T3, T4, U>(
  l1: Lens<T1, T2>, l2: Lens<T2, T3>, l3: Lens<T3, T4>, l4: Lens<T4, U>
): Lens<T1, U>

export function compose<T1, T2, T3, T4, T5, U>(
  l1: Lens<T1, T2>, l2: Lens<T2, T3>, l3: Lens<T3, T4>, l4: Lens<T4, T5>, l5: Lens<T5, U>
): Lens<T1, U>

export function compose<T, U>(...lenses: Lens<any, any>[]): Lens<T, U>

export function compose<T, U>(...lenses: Lens<any, any>[]): Lens<T, U> {
  if (lenses.length === 0) {
    throw new TypeError('Can not compose zero lenses. You probably want `Lens.identity`.')
  } else if (lenses.length === 1) {
    return lenses[0]
  } else {
    let r = lenses[0]
    lenses.slice(1).forEach(l => {
      r = r.compose(l)
    })
    return r as Lens<T, U>
  }
}

const _identity = create<any, any>(x => x, (x: any, _: any) => x)

/**
 * The identity lens – a lens that reads and writes the object itself.
 */
export function identity<T>(): Lens<T, T> {
  return _identity as Lens<T, T>
}

const _nothing = createPrism(_ => undefined, (_: any, o: any) => o)

/**
 * A lens that always returns `undefined` on `get` and does no change on `set`.
 */
export function nothing<TSource, T>() {
  return _nothing as Prism<TSource, T>
}
