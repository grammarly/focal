/**
 * Structural equality, ported from Ramda.js with adaptations.
 * See original source at
 * https://github.com/ramda/ramda/tree/793c2a10350e7e669ab6474d9c7fa60f8f2ce611
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2016 Scott Sauyet and Michael Hurley
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

function arrayFromIterator<T>(iter: Iterator<T>) {
  const result: T[] = []
  let next: IteratorResult<T>
  while (!(next = iter.next()).done) {
    result.push(next.value)
  }
  return result
}

function functionName(f: Function) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  const match = String(f).match(/^function (\w*)/)
  return match == null ? '' : match[1]
}

function has(prop: string, obj: any) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

/**
 * Returns true if its arguments are identical, false otherwise. Values are
 * identical if they reference the same memory. `NaN` is identical to `NaN`
 * `0` and `-0` are not identical.
 *
 * @example
 *
 *      var o = {}
 *      R.identical(o, o); //=> true
 *      R.identical(1, 1); //=> true
 *      R.identical(1, '1'); //=> false
 *      R.identical([], []); //=> false
 *      R.identical(0, -0); //=> false
 *      R.identical(NaN, NaN); //=> true
 */
function identical(a: any, b: any) {
  // SameValue algorithm
  if (a === b) { // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return a !== 0 || 1 / a === 1 / b
  } else {
    // Step 6.a: NaN == NaN
    return a !== a && b !== b
  }
}

const _isArguments = ((function () {
  const toString = Object.prototype.toString

  /* eslint-disable brace-style */
  return toString.call(arguments) === '[object Arguments]'
    ? function isArguments(x: any) { return toString.call(x) === '[object Arguments]' }
    : function isArguments(x: any) { return has('callee', x) }
  /* eslint-enable brace-style */
}) ())

/**
 * Returns a list containing the names of all the enumerable own properties of
 * the supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 */
const keys = ((function () {
  // cover IE < 9 keys issues
  const hasEnumBug = !({ toString: null }).propertyIsEnumerable('toString')

  const nonEnumerableProps = [
    'constructor', 'valueOf', 'isPrototypeOf', 'toString',
    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'
  ]

  // Safari bug
  const hasArgsEnumBug = ((function () {
    'use strict'
    return arguments.propertyIsEnumerable('length')
  }) ())

  // eslint-disable-next-line func-style
  const contains = function contains<T>(list: T[], item: T) {
    var idx = 0 // eslint-disable-line no-var

    while (idx < list.length) {
      if (list[idx] === item)
        return true

      idx += 1
    }

    return false
  }

  return typeof Object.keys === 'function' && !hasArgsEnumBug
    ? function keys(obj: any) {
      return Object(obj) !== obj ? [] : Object.keys(obj)
    }
    : function keys(obj: any) {
      if (Object(obj) !== obj) return []

      let prop: string, nIdx: number
      const ks: string[] = []
      const checkArgsLength = hasArgsEnumBug && _isArguments(obj)

      for (prop in obj) {
        if (has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
          ks[ks.length] = prop
        }
      }

      if (hasEnumBug) {
        nIdx = nonEnumerableProps.length - 1
        while (nIdx >= 0) {
          prop = nonEnumerableProps[nIdx]
          if (has(prop, obj) && !contains(ks, prop)) {
            ks[ks.length] = prop
          }
          nIdx -= 1
        }
      }

      return ks
    }
}) ())

type TypeDescString =
  'Object' | 'Number' | 'Boolean' | 'String' | 'Null' | 'Array' | 'RegExp' |
  'Int8Array' | 'Uint8Array' | 'Uint8ClampedArray' | 'Int16Array' | 'Uint16Array' |
  'Int32Array' | 'Uint32Array' | 'Float32Array' | 'Float64Array' | 'Arguments' |
  'Map' | 'Set' | 'Date' | 'Error' | 'ArrayBuffer' | 'Undefined'

/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @example
 *
 *      R.type({}); //=> "Object"
 *      R.type(1); //=> "Number"
 *      R.type(false); //=> "Boolean"
 *      R.type('s'); //=> "String"
 *      R.type(null); //=> "Null"
 *      R.type([]); //=> "Array"
 *      R.type(/[A-z]/); //=> "RegExp"
 */
function type(val: any) {
  return val === null ? 'Null' as TypeDescString
    : val === undefined ? 'Undefined' as TypeDescString
    : Object.prototype.toString.call(val).slice(8, -1) as TypeDescString
}

/**
 * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
 * cyclical data structures.
 *
 * Dispatches symmetrically to the `equals` methods of both arguments, if
 * present.
 *
 * @example
 *
 *      equals(1, 1); //=> true
 *      equals(1, '1'); //=> false
 *      equals([1, 2, 3], [1, 2, 3]); //=> true
 *
 *      var a = {}; a.v = a
 *      var b = {}; b.v = b
 *      equals(a, b); //=> true
 */
export function equals(a: any, b: any, stackA: any[] = [], stackB: any[] = []) {
  if (identical(a, b)) return true
  if (type(a) !== type(b)) return false
  if (a == null || b == null) return false

  if (typeof a.equals === 'function' || typeof b.equals === 'function') {
    return typeof a.equals === 'function' && a.equals(b) &&
      typeof b.equals === 'function' && b.equals(a)
  }

  switch (type(a)) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      if (typeof a.constructor === 'function' &&
        functionName(a.constructor) === 'Promise') {
        return a === b
      }
      break

    case 'Boolean':
    case 'Number':
    case 'String':
      if (!(typeof a === typeof b && identical(a.valueOf(), b.valueOf())))
        return false

      break

    case 'Date':
      if (!identical(a.valueOf(), b.valueOf()))
        return false

      break

    case 'Error':
      return a.name === b.name && a.message === b.message

    case 'RegExp':
      if (!(a.source === b.source &&
        a.global === b.global &&
        a.ignoreCase === b.ignoreCase &&
        a.multiline === b.multiline &&
        a.sticky === b.sticky &&
        a.unicode === b.unicode)) {
        return false
      }

      break

    case 'Map':
    case 'Set':
      if (!equals(arrayFromIterator(a.entries()), arrayFromIterator(b.entries()), stackA, stackB))
        return false

      break

    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
      break

    case 'ArrayBuffer':
      break

    default:
      // Values of other types are only equal if identical.
      return false
  }

  const keysA = keys(a)
  if (keysA.length !== keys(b).length)
    return false

  let idx = stackA.length - 1
  while (idx >= 0) {
    if (stackA[idx] === a)
      return stackB[idx] === b

    idx -= 1
  }

  stackA.push(a)
  stackB.push(b)
  idx = keysA.length - 1
  while (idx >= 0) {
    const key = keysA[idx]

    if (!(has(key, b) && equals(b[key], a[key], stackA, stackB)))
      return false

    idx -= 1
  }
  stackA.pop()
  stackB.pop()

  return true
}
