import { Optic, createModify } from './base'

export function optic<TSource, T, U>(
  getter: (s: TSource) => T,
  setter: (v: U, s: TSource) => TSource
): Optic<TSource, T, U> {
  return {
    get: getter,
    set: setter,
    modify: createModify(getter, setter)
  }
}
