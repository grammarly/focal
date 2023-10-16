import { Option } from './../utils'

export interface Optic<TSource, T, U> {
  get(s: TSource): T
  set(v: U, s: TSource): TSource
  modify(updateFn: (v: T) => U, s: TSource): TSource

  // @TODO can't optic compose?
}

export function createModify<TSource, T, U>(
  getter: (s: TSource) => T,
  setter: (v: U, s: TSource) => TSource
) {
  return function modify(updateFn: (v: T) => U, s: TSource) {
    return setter(updateFn(getter(s)), s)
  }
}

// @NOTE lens and prism are monomorphic: can't change the type of
// focused value on update

/**
 * The lens interface.
 *
 * Lens is a kind of functional reference – an abstraction that allows
 * you to operate on part(s) of a value in a purely-functional setting.
 *
 * Read more here: https://en.wikibooks.org/wiki/Haskell/Lenses_and_functional_references
 */
export interface Lens<TSource, T> extends Optic<TSource, T, T> {
  compose<U>(next: Lens<T, U>): Lens<TSource, U>
  compose<U>(next: Prism<T, U>): Prism<TSource, U>
}

export interface Prism<TSource, T> extends Optic<TSource, Option<T>, T> {
  compose<U>(next: Lens<T, U>): Prism<TSource, U>
  compose<U>(next: Lens<Option<T>, U>): Lens<TSource, U>
  compose<U>(next: Prism<T, U>): Prism<TSource, U>
}
