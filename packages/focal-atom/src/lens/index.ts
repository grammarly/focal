/**
 * Lenses and operations on them. Built in mind with an ordinary JSON
 * as the underlying datatype, but the base lens functionality will work
 * for any datatype.
 *
 * More about lenses in general:
 * - https://en.wikibooks.org/wiki/Haskell/Lenses_and_functional_references
 * - http://www.haskellforall.com/2013/05/program-imperatively-using-haskell.html
 *
 * @module
 */

import type { Lens as LensType, Prism as PrismType, Optic as OpticType } from './base'

export type Lens<TSource, T> = LensType<TSource, T>
export type Prism<TSource, T> = PrismType<TSource, T>
export type Optic<TSource, T, U> = OpticType<TSource, T, U>

export * as Optic from './optic'
export * as Prism from './prism'
export * as Lens from './lens'

export {
  PropExpr
} from './json'
