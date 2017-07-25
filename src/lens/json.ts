/**
 * Lenses for JSON data.
 *
 * @module
 */

import {
  structEq,
  setKey,
  conservatively,
  findIndex,
  Option,
  warning
} from './../utils'

import { Lens, Prism } from './base'

export type PropExpr<O, P> = (x: O) => P

const defaultOptions = {
    // @TODO can we optimize this regexp?
    propExprRe: new RegExp([
      '^', 'function', '\\(', '[^), ]+', '\\)', '\\{',
        '("use strict";)?',
        'return\\s',
          '[^\\.]+\\.(\\S+?);?',
      '\\}', '$'
    ].join('\\s*')),
    exprRegexpGroup: 2
}

/**
 * Custom parse options for code instrumentalization through environment variable
 */
export const { propExprRe, exprRegexpGroup } = (() => {
  if (process.env.FOCAL_PROP_EXPR_RE && process.env.FOCAL_PROP_EXPR_RE_GROUP) {
    try {
      return {
        propExprRe: new RegExp(process.env.FOCAL_PROP_EXPR_RE),
        exprRegexpGroup: parseInt(process.env.FOCAL_PROP_EXPR_RE_GROUP, 10)
      }
    } catch (e) {
      warning(
        'Environment variable could not be converted to appropriate type, '
        + 'falling back to default settings.'
        + e
      )
      return defaultOptions
    }
  } else return defaultOptions
})()

export function parsePropertyPath(getterSource: string): string[] {
  const parse = getterSource.match(propExprRe)

  if (parse && parse[exprRegexpGroup]) {
    return parse[exprRegexpGroup].split('.')
  } else {
    throw new TypeError(`Expected a property expression, got "${getterSource}".

      A property expression should be a referentially transparent (no side-effects),
      single-expression "getter" function.

      Correct example: "function (x) { return x.some }" or "x => x.some".
      Incorrect example: "function (x) { var y = x.some; return y }" or "({some}) => some"`)
  }
}

/**
 * Extract a list of property names from a {@link LensExpr}
 *
 * @param target The target property expressions
 * @example
 * type Second = { two: string }
 * type First = { one: Second }
 * // returns ['one', 'two']
 * extractPropertyNames((x: First) => x.one.two)
 * @returns A list of nested property names
 * @throws Will throw if the target lens expression is of a not valid form
 */
export function extractPropertyPath<TObject, TProperty>(
  target: PropExpr<TObject, TProperty>
): string[] {
  return parsePropertyPath(target.toString())
}

// tslint:disable no-unused-vars
export function keyImpl(k: string): Prism<{ [k: string]: any }, any>
export function keyImpl<TValue>(k: string): Prism<{ [k: string]: TValue }, TValue>
// tslint:enable no-unused-vars

export function keyImpl(k: string): Prism<{ [k: string]: any }, any> {
  return Lens.create(
    (s: { [k: string]: any }) => s[k] as Option<any>,
    (v: any, s: { [k: string]: any }) => setKey(k, v, s)
  )
}

export function unsafeKeyImpl<TValue>(k: string): Prism<{ [k: string]: any }, TValue> {
  return Lens.key(k)
}

export function propImpl<TObject, TProperty>(
  getter: PropExpr<TObject, TProperty>
): Lens<TObject, TProperty> {
  // @TODO can we optimize this?
  return Lens.compose<TObject, TProperty>(
    ...extractPropertyPath(getter as PropExpr<TObject, TProperty>)
      .map(keyImpl))
}

export function indexImpl<TItem>(i: number): Prism<TItem[], TItem> {
  if (i < 0)
    throw new TypeError(`${i} is not a valid array index, expected >= 0`)

  return Prism.create(
    (xs: TItem[]) => xs[i] as Option<TItem>,
    (v: TItem, xs: TItem[]) => {
      if (xs.length <= i) {
        return xs.concat(Array(i - xs.length), [v])
      } else if (structEq(v, xs[i])) {
        return xs
      } else {
        return xs.slice(0, i).concat([v], xs.slice(i + 1))
      }
    }
  )
}

export function withDefaultImpl<T>(defaultValue: T): Lens<Option<T>, T> {
  // @TODO is this cast safe?
  return Lens.replace(undefined, defaultValue) as Lens<Option<T>, T>
}

function choose<T, U>(getLens: (state: T) => Lens<T, U>): Lens<T, U> {
  return Lens.create(
    (s: T) => getLens(s).get(s),
    (v: U, s: T) => getLens(s).set(v, s)
  )
}

export function replaceImpl<T>(originalValue: T, newValue: T): Lens<T, T> {
  return Lens.create<T, T>(
    x => structEq(x, originalValue) ? newValue : x,
    conservatively((y: T) => structEq(y, newValue) ? originalValue : y)
  )
}

export function findImpl<T>(predicate: (x: T) => boolean): Prism<T[], T> {
  return choose((xs: T[]) => {
    const i = findIndex(xs, predicate)

    return i < 0
      ? Lens.nothing<T[], T>()
      : Lens.index<T>(i)
  })
}

// augment the base lens module with JSON-specific lens functions.
// @TODO this doesn't look like the best way to do it. we only do it
// for a nice consumer API with all lens function under the same namespace,
// together with the lens type.
declare module './base' {
  export namespace Lens {
    /**
     * Create a prism to an object's key.
     *
     * @static
     * @template TValue the type of key's value
     * @param k target key name
     * @returns a lens to an object's value at key k
     */
    export let key: typeof keyImpl

    /**
     * Create an *unsafe* prism to an object's key.
     *
     * This optic is unsafe in it's generic parameter, as it disregards the
     * actual type of the value at runtime – it just does unsafe type assertion.
     *
     * @TODO how's this different from key?
     */
    export let unsafeKey: typeof unsafeKeyImpl

    /**
     * Create a lens to an object's property. The argument is a property expression, which
     * is a limited form of a getter, with following restrictions:
     * - should be a pure function
     * - should be a single-expression function (i.e. return immediately)
     * - should only access object properties (nested access is OK)
     *
     * @example
     * const obj = { a: { b: 5 } }
     *
     * const l = Lens.prop((x: typeof obj) => x.a.b)
     *
     * l.modify(x => x + 1, obj)
     * // => { a: { b: 6 } }
     * @template TObject type of the object
     * @template TProperty type of the property
     * @param propExpr property get expression
     * @returns a lens to an object's property
     */
    export let prop: typeof propImpl

    /**
     * Create a lens that looks at an element at particular index position
     * in an array.
     *
     * @template TItem type of array elements
     * @param i the index
     * @returns a lens to an element at particular position in an array
     */
    export let index: typeof indexImpl

    /**
     * Create a lens that will show a given default value if the actual
     * value is absent (is undefined).
     *
     * @param defaultValue default value to return
     */
    export let withDefault: typeof withDefaultImpl

    /**
     * Create a lens that replaces a given value with a new one.
     */
    export let replace: typeof replaceImpl

    /**
     * Create a prism that focuses on an array's element that
     * satisfies a given predicate.
     */
    export let find: typeof findImpl
  }
}

Lens.key = keyImpl
Lens.unsafeKey = unsafeKeyImpl
Lens.prop = propImpl
Lens.index = indexImpl
Lens.withDefault = withDefaultImpl
Lens.replace = replaceImpl
Lens.find = findImpl
