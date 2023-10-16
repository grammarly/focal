import { Lens, Prism, createModify } from './base'
import { Option } from './../utils'

export function create<TSource, T>(
  getter: (s: TSource) => Option<T>,
  setter: (v: T, s: TSource) => TSource
): Prism<TSource, T> {
  return {
    get: getter,
    set: setter,
    modify: createModify(getter, setter),

    compose<U>(next: Lens<T, U> | Prism<T, U>): Prism<TSource, U> {
      // no runtime dispatch – the implementation works for both
      // lens and prism argument
      return create(
        (s: TSource) => {
          const x = getter(s)
          return x !== undefined
            ? next.get(x)
            : undefined
        },
        (v: U, s: TSource) => {
          const x = getter(s)
          return x !== undefined
            ? setter(next.set(v, x), s)
            : s
        }
      )
    }
  }
}
