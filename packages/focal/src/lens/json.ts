/**
 * Lenses for JSON data.
 *
 * @module
 */

import { structEq, setKey, conservatively, findIndex, Option, DEV_ENV, warning } from './../utils'

import { Lens, Prism } from './base'

export type PropExpr<O, P> = (x: O) => P

// @TODO can we optimize this regexp?
const PROP_EXPR_RE = new RegExp(
  [
    '^',
    'function',
    '\\(',
    '[^), ]+',
    '\\)',
    '\\{',
    '("use strict";)?',
    'return\\s',
    '[^\\.]+\\.(\\S+?);?',
    '\\}',
    '$'
  ].join('\\s*')
)

const WALLABY_PROP_EXPR_RE = new RegExp(
  [
    '^',
    'function',
    '\\(',
    '[^), ]+',
    '\\)',
    '\\{',
    '("use strict";)?',
    '(\\$_\\$wf\\(\\d+\\);)?', // wallaby.js code coverage compatability (#36)
    'return\\s',
    '(\\$_\\$w\\(\\d+, \\d+\\),\\s)?', // wallaby.js code coverage compatability (#36)
    '[^\\.]+\\.(\\S+?);?',
    '\\}',
    '$'
  ].join('\\s*')
)

export function parsePropertyPath(getterSource: string): string[] {
  const exprRegexp = process.env.NODE_ENV === 'wallaby' ? WALLABY_PROP_EXPR_RE : PROP_EXPR_RE
  const exprRegexpGroup = process.env.NODE_ENV === 'wallaby' ? 4 : 2

  const parse = getterSource.match(exprRegexp)
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
 * Extract a list of property names from a {@link PropExpr}
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

// @NOTE only need this interface to add JSDocs for this call.
export interface KeyImplFor<TObject> {
  /**
   * Create a lens focusing on a key of an object.
   *
   * Requires two subsequent calls, first with only a type argument and no function
   * arguments and second with the key argument.
   *
   * This enables better auto-completion, and is required because TypeScript does not
   * allow to specify only some of the type arguments.
   *
   * This is the second call, where you supply the key argument.
   * @example
   * interface SomeObject {
   *   someProp: number
   * }
   *
   * const lens = Lens.key<SomeObject>()('someProp')
   */
  <K extends keyof TObject>(k: K): Lens<TObject, TObject[K]>
}

/**
 * Create a prism focusing on a key of a dictionary.
 *
 * @param k the key to focus on
 */
export function keyImpl<TValue = any>(k: string): Prism<{ [k: string]: TValue }, TValue>

/**
 * Create a lens focusing on a key of an object.
 *
 * Requires two subsequent calls, first with only a type argument and no function
 * arguments and second with the key argument.
 *
 * This enables better auto-completion, and is required because TypeScript does not
 * allow to specify only some of the type arguments.
 *
 * This is the first call, where you only supply the type argument.
 *
 * @example
 * interface SomeObject {
 *   someProp: number
 * }
 *
 * const lens = Lens.key<SomeObject>()('someProp')
 * @template TObject type of the data structure the lens is focusing into
 */
// @NOTE we're doing this in two subsequent function applications because TS can either
// infer all type parameters or none, and in this case there's nothing for it to infer the
// TObject parameter from.
//
// By doing this in two function applications we can make TS infer they key type parameter
// (K), which enables auto-completion for keys without needing to also state the key twice,
// once as a type argument, and once as a function argument.
//
// Without this hack, it would look like this:
//   keyImpl<SomeObject, 'someKey'>('someKey')
//
// Instead, we get this:
//   keyImpl<SomeObject>()('someKey')
//
// Pretty cool!
export function keyImpl<TObject = any>(): KeyImplFor<TObject>

export function keyImpl<TObject>(k?: string) {
  return k === undefined
    ? // type-safe key
      <K extends keyof TObject>(k: K): Lens<TObject, TObject[K]> =>
        Lens.create<TObject, TObject[K]>(
          (s: TObject) => s[k],
          (v: TObject[K], s: TObject) => setKey(k, v, s)
        )
    : // untyped key
      Lens.create(
        (s: { [k: string]: any }) => s[k] as Option<any>,
        (v: any, s: { [k: string]: any }) => setKey(k, v, s)
      )
}

let propExprDeprecatedWarnings = 0

function warnPropExprDeprecated(path: string[]) {
  // don't warn more than a few times
  if (propExprDeprecatedWarnings < 10) {
    propExprDeprecatedWarnings++

    const propExpr = `x.${path.join('.')}`
    const keys = `'${path.join("', '")}'`

    warning(
      `The property expression overload of Atom.lens and Lens.prop are deprecated and ` +
        `will be removed in next versions of Focal. Please use the key name overload for ` +
        `Atom.lens and Lens.key instead. ` +
        `You can convert your code by changing the calls:
  a.lens(x => ${propExpr}) to a.lens(${keys}),
  Lens.prop((x: T) => ${propExpr}) to Lens.key<T>()(${keys}).`
    )
  }
}

export function propImpl<TObject, TProperty>(
  getter: PropExpr<TObject, TProperty>
): Lens<TObject, TProperty> {
  const path = extractPropertyPath(getter as PropExpr<TObject, TProperty>)
  if (DEV_ENV) warnPropExprDeprecated(path)

  // @TODO can we optimize this?
  return Lens.compose<TObject, TProperty>(...path.map(keyImpl()))
}

export function indexImpl<TItem>(i: number): Prism<TItem[], TItem> {
  if (i < 0) throw new TypeError(`${i} is not a valid array index, expected >= 0`)

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
  return Lens.create((s: T) => getLens(s).get(s), (v: U, s: T) => getLens(s).set(v, s))
}

export function replaceImpl<T>(originalValue: T, newValue: T): Lens<T, T> {
  return Lens.create<T, T>(
    x => (structEq(x, originalValue) ? newValue : x),
    conservatively((y: T) => (structEq(y, newValue) ? originalValue : y))
  )
}

export function findImpl<T>(predicate: (x: T) => boolean): Prism<T[], T> {
  return choose((xs: T[]) => {
    const i = findIndex(xs, predicate)

    return i < 0 ? Lens.nothing<T[], T>() : Lens.index<T>(i)
  })
}

// augment the base lens module with JSON-specific lens functions.
// @TODO this doesn't look like the best way to do it. we only do it
// for a nice consumer API with all lens function under the same namespace,
// together with the lens type.
declare module './base' {
  export namespace Lens {
    export let key: typeof keyImpl

    /**
     * DEPRECATED: please use Lens.key instead!
     *
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
Lens.prop = propImpl
Lens.index = indexImpl
Lens.withDefault = withDefaultImpl
Lens.replace = replaceImpl
Lens.find = findImpl
