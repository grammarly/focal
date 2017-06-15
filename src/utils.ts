import * as React from 'react'
import { Atom } from './atom/base'
import { equals as structEq } from './equals'
export { equals as structEq } from './equals'

export const DEV_ENV = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'

export function setKey<T>(k: string, v: T, o?: { [k: string]: any; }) {
  if (o === undefined) {
    return { [k]: v }
  } else if (k in o && structEq(v, o[k])) {
    return o
  } else {
    const r: { [k: string]: any; } = { [k]: v }
    for (const p in o) {
      if (p !== k) {
        r[p] = o[p]
      }
    }
    return r
  }
}

/**
 * 'Conserve' a value's identity if its structure doesn't change.
 */
function conserve<T>(x: T, y: T): T {
  return structEq(x, y) ? y : x
}

/**
 * Make a fold function's behaviour conservative in its input value's
 * identity.
 */
export function conservatively<T, U>(fn: ((y: T, c0: U) => U)) {
  return (y: T, c0: U) => conserve(fn(y, c0), c0)
}

export function findIndex<T>(xs: T[], p: (x: T) => boolean): number {
  for (let i = 0; i < xs.length; i++) {
    if (p(xs[i])) return i
  }
  return -1
}

export function warning(message: string) {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error('[Focal]: ' + message) // tslint:disable-line no-console
  }

  // Throw a dummy error so it's possible to enter debugger with
  // 'break on all exceptions'.
  try { throw new Error(message) } catch (_) { /* no-op */ }
}

export function getReactComponentName(
  component: string
    | React.ComponentClass<any>
    | React.StatelessComponent<any>
    | React.Component<any, any>
) {
  return typeof component === 'string' ? component
    : (component as React.ComponentClass<any>).displayName !== undefined
      ? (component as React.ComponentClass<any>).displayName
    : (component as React.StatelessComponent<any>).name !== undefined
      ? (component as React.StatelessComponent<any>).name
    : component.constructor && component.constructor.name !== undefined
      ? component.constructor.name
    : undefined
}

export type Option<T> = T | undefined

export namespace Option {
  export function isNone<T>(x: Option<T>): x is undefined {
    return x === undefined
  }

  export function isSome<T>(x: Option<T>): x is T {
    return x !== undefined
  }
}

export function createLogger<T>(atom: Atom<T>, name?: string): Atom<T> {
  let prevState = atom.get()

  atom.subscribe(state => {
    console.group(`UPDATE ${name ? `TYPE: ${name} ` : ''}@ ${new Date().toTimeString()}`)
    log('prev state', '#9E9E9E', prevState)
    log('next state', '#4CAF50', state)
    console.groupEnd()
    prevState = state
  })

  return atom

  function log(msg: string, color: string, x: T) {
    console.log('%c' + msg, `color: ${color}; font-weight: bold`, x)
  }
}
