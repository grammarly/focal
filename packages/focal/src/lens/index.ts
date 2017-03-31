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
import {
  Lens, Prism, Optic
} from './base'

// This import adds JSON-specific lens functions to the Lens
// namespace, in style of RxJS.
//
// It's probably not the best way (these magic imports in general),
// but so far I haven't found a better way to:
// 1) have everything in a single namespace (for convenient usage)
//   and
// 2) have base Lens definitions and JSON Lens definitions in separate
//   modules.
//
// But maybe there is a way to avoid this?
import './json'

export {
  PropExpr
} from './json'

export {
  Lens, Prism, Optic
}
