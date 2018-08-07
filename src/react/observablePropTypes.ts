/**
 * This module defines augmented React element/props types that accept
 * observable values.
 *
 * @NOTE:
 * Q: Why doesn't this just use mapped types?
 * A: Mostly because right now it is not possible have an interface that extends
 * a mapped type. Because of that we will have to have generic structural types,
 * which get inlined into intrinsic component function definitions, expanding the
 * intrinsic.d.ts to a 3MB and slowing down VSCode to the point of uselessness.
 *
 * Right now we are using a mapped type of ObservableCSSReactProperties, and it works out fine
 * because in the end it's a property of the ObservableReactHTMLProps interface, and is not
 * inlined in intrinsic component function definitions.
 *
 * Hopefully we can find a way to use mapped types for all of these types in future.
 *
 * @module
 */
import * as React from 'react'
import { Observable } from 'rxjs/Observable'

export type ObservableOr<T> = Observable<T> | T
export type AcceptObservableValues<T> = { [K in keyof T]: ObservableOr<T[K]> }

/**
 * It's a workaround to set proper type for style
 */
export interface ObservableCSSReactProperties {
  style?: ObservableOr<React.CSSProperties> | AcceptObservableValues<React.CSSProperties>
}

export interface ObservableReactChildren {
  children?: ObservableOr<React.ReactNode>
}

export interface ObservableReactHTMLAttributes<E>
  extends AcceptObservableValues<React.AllHTMLAttributes<E>> {}

/**
 * It's a workaround to set proper type for style
 *
 * TS 2.8 provides more eloquient way to do it
 *
 * type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
 * export interface ObservableReactHTMLAttributes<E>
 *  extends AcceptObservableValues<Omit<React.AllHTMLAttributes<E>>, 'style'> {
 *   style?: ObservableOr<React.CSSProperties> | AcceptObservableValues<React.CSSProperties>
 * }
 *
 */

export interface ObservableReactHTMLProps<E>
  extends ObservableReactHTMLAttributes<E>,
    React.ClassAttributes<E> {}
