import { Observable, BehaviorSubject, Subscription } from 'rxjs'
import { tap, share, filter } from 'rxjs/operators'

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
   * @param eq - optional custom equality check function,
   * used to compare prev and next atom values to emit value only when it has changed.
   *
   * !!!BEWARE!!!: make sure that your custom equality check function is optimal
   * (e.g. checks for value reference equality first),
   * as it will be called EVERY time an atom value is changed
   *
   * (when setting(modifying) an atom value, a new value is only emitted by atom if it has changed,
   * i.e. it does not equal to the previous value)
   *
   * If not specified, a default private implementation of structure equality is used.
   *
   * As an alternative, a value may have an 'equals' method that will be recognized
   * by default structure equality implementation
   * @returns fresh atom
   */
  export function create<T>(initialValue: T, eq?: (x: T, y: T) => boolean): Atom<T> {
    return new JsonAtom(initialValue, eq)
  }

  // tslint:disable no-unused-vars
  export function log<T>(
    atom: Atom<T>,
    name?: string
  ): Atom<T>

  export function log<T>(
    atom: ReadOnlyAtom<T>,
    name?: string
  ): ReadOnlyAtom<T>

  export function log<T>(
    atom: Atom<T>,
    logger?: (prevState: T, newState: T) => void
  ): Atom<T>

  export function log<T>(
    atom: ReadOnlyAtom<T>,
    logger?: (prevState: T, newState: T) => void
  ): ReadOnlyAtom<T>
  // tslint:enable no-unused-vars

  export function log<T>(
    atom: Atom<T> | ReadOnlyAtom<T>,
    logger?: string | ((prevState: T, newState: T) => void)
  ): Atom<T> | ReadOnlyAtom<T> {
    const logState = (msg: string, color: string, x: T) =>
      console.log('%c' + msg, `color: ${color}; font-weight: bold`, x)
    let prevState = atom.get()

    atom.subscribe(newState => {
      if (typeof logger === 'function') {
        logger(prevState, newState)
      } else {
        console.group(`UPDATE ${logger ? `TYPE: ${logger} ` : ''}@ ${new Date().toTimeString()}`)
        logState('prev state', '#9E9E9E', prevState)
        logState('next state', '#4CAF50', newState)
        console.groupEnd()
      }
      prevState = newState
    })

    return atom
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

  /**
   * Converts an observable to a read-only atom.
   *
   * The returned atom is wrapped into an observable, which will only emit a single value.
   * The source observable will only be subscribed to for as long as there is at least one
   * subscription to the returned observable.
   *
   * The returned observable never completes and controls the lifecycle of the emitted atom:
   * as long as it's subscribed to, the returned atom will have its value updated from the
   * source observable.
   *
   * @export
   * @template T type of atom values
   * @param src the source observable
   * @returns an observable that emits a read-only atom
   */
  export function fromObservable<T>(src: Observable<T>) {
    const atomSubj = new BehaviorSubject<Atom<T> | null>(null)

    const initAndUpdateAtom = src.pipe(
      tap(x => {
        const atom = atomSubj.value

        if (atom === null) {
          atomSubj.next(Atom.create(x))
        } else atom.set(x)
      }),
      // prevent updating atom multiple times to the same value
      share()
    )

    return new Observable<ReadOnlyAtom<T>>(o => {
      const sub = new Subscription()

      sub.add(
        atomSubj
          .pipe(filter((x): x is Atom<T> => !!x))
          .subscribe(o)
      )

      sub.add(initAndUpdateAtom.subscribe(
        undefined,
        // propagate errors
        e => o.error(e),
        // propagate completion
        () => o.complete()
      ))

      return sub
    })
  }
}
