import * as React from 'react'

export const DEV_ENV = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'

export function warning(message: string) {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error('[Focal]: ' + message)
  }

  // Throw a dummy error so it's possible to enter debugger with
  // 'break on all exceptions'.
  try {
    throw new Error(message)
  } catch (_) {
    /* no-op */
  }
}

export function getReactComponentName(
  component: string
    | React.ComponentClass<any>
    | React.FunctionComponent<any>
    | React.Component<any, any>
) {
  return typeof component === 'string' ? component
    : (component as React.ComponentClass<any>).displayName !== undefined
      ? (component as React.ComponentClass<any>).displayName
    : (component as React.FunctionComponent<any>).name !== undefined
      ? (component as React.FunctionComponent<any>).name
    : component.constructor && component.constructor.name !== undefined
      ? component.constructor.name
    : undefined
}
