/**
 * This module defines augmented React element/props types that accept
 * observable values.
 *
 * @module
 */
import * as React from 'react'
import { ObservableLike } from './react'

export type ObservableLikeRecord<T> = { [K in keyof T]: ObservableLike<T[K]> }

export type ObservableReactCSSProperties =
  ObservableLike<React.CSSProperties> | ObservableLikeRecord<React.CSSProperties>

export interface ObservableReactChildren {
  children?: ObservableLike<React.ReactNode> | ObservableLike<React.ReactNode>[]
}

export type ObservableReactHTMLAttributes<
  E, A extends React.HTMLAttributes<E> = React.AllHTMLAttributes<E>
> = ObservableLikeRecord<Omit<A, 'style' | 'children'>> & {
  style?: ObservableReactCSSProperties
  children?: ObservableLike<React.ReactNode> | ObservableLike<React.ReactNode>[]
}

export type ObservableReactHTMLProps<
  E, A extends React.HTMLAttributes<E> = React.AllHTMLAttributes<E>,
  > = ObservableReactHTMLAttributes<E, A> & React.ClassAttributes<E>
