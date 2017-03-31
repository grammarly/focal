import {
  Atom as _Atom,
  ReadOnlyAtom,
  JsonAtom,
  CombinedAtomViewImpl
} from './base'

export {
  ReadOnlyAtom
} from './base'

// a hack we need to do so we can merge the Atom type with
// the namespace below and then export it.
export type Atom<T> = _Atom<T>

export namespace Atom {
  /**
   * Create an atom with given initial value.
   *
   * @export
   * @template T type of atom values
   * @param initialValue initial value for this atom
   * @returns fresh atom
   */
  export function create<T>(initialValue: T): Atom<T> {
    return new JsonAtom(initialValue)
  }

  // tslint:disable no-unused-vars
  export function combine<T1, T2, TResult>(
    source1: ReadOnlyAtom<T1>,
    source2: ReadOnlyAtom<T2>,
    combineFn: (x1: T1, x2: T2) => TResult
  ): ReadOnlyAtom<TResult>

  export function combine<T1, T2, T3, TResult>(
    source1: ReadOnlyAtom<T1>,
    source2: ReadOnlyAtom<T2>,
    source3: ReadOnlyAtom<T3>,
    combineFn: (x1: T1, x2: T2, x3: T3) => TResult
  ): ReadOnlyAtom<TResult>

  export function combine<T1, T2, T3, T4, TResult>(
    source1: ReadOnlyAtom<T1>,
    source2: ReadOnlyAtom<T2>,
    source3: ReadOnlyAtom<T3>,
    source4: ReadOnlyAtom<T4>,
    combineFn: (x1: T1, x2: T2, x3: T3, x4: T4) => TResult
  ): ReadOnlyAtom<TResult>

  export function combine<T1, T2, T3, T4, T5, TResult>(
    source1: ReadOnlyAtom<T1>,
    source2: ReadOnlyAtom<T2>,
    source3: ReadOnlyAtom<T3>,
    source4: ReadOnlyAtom<T4>,
    source5: ReadOnlyAtom<T5>,
    combineFn: (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5) => TResult
  ): ReadOnlyAtom<TResult>

  export function combine<T1, T2, T3, T4, T5, T6, TResult>(
    source1: ReadOnlyAtom<T1>,
    source2: ReadOnlyAtom<T2>,
    source3: ReadOnlyAtom<T3>,
    source4: ReadOnlyAtom<T4>,
    source5: ReadOnlyAtom<T5>,
    source6: ReadOnlyAtom<T6>,
    combineFn: (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6) => TResult
  ): ReadOnlyAtom<TResult>

  export function combine<T1, T2, T3, T4, T5, T6, T7, TResult>(
    source1: ReadOnlyAtom<T1>,
    source2: ReadOnlyAtom<T2>,
    source3: ReadOnlyAtom<T3>,
    source4: ReadOnlyAtom<T4>,
    source5: ReadOnlyAtom<T5>,
    source6: ReadOnlyAtom<T6>,
    source7: ReadOnlyAtom<T7>,
    combineFn: (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7) => TResult
  ): ReadOnlyAtom<TResult>
  // tslint:enable no-unused-vars

  export function combine<TResult>(
    ...args: (ReadOnlyAtom<any> | ((...xs: any[]) => TResult))[]
  ) {
    return new CombinedAtomViewImpl<TResult>(
      args.slice(undefined, -1) as ReadOnlyAtom<any>[],
      xs => (args[args.length - 1] as ((...xs: any[]) => TResult))(...xs)
    )
  }
}
