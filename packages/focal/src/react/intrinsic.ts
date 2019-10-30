/**
 * Lifted intrinsic React components that accept observable props.
 *
 * @module
 */
import * as React from 'react'
import { ObservableReactHTMLProps, ObservableReactChildren } from './observablePropTypes'
import { LiftWrapperProps, LiftWrapper } from './react'

export interface LiftedIntrinsicComponentProps<E> extends ObservableReactHTMLProps<E> {
  mount?: React.Ref<E>
  forwardRef?: React.Ref<E>
}

export interface LiftedIntrinsic<
  E extends Element, A extends React.HTMLAttributes<E> = React.AllHTMLAttributes<E>> {
  (props: LiftedIntrinsicComponentProps<E>):
    React.ReactElement<LiftWrapperProps<ObservableReactHTMLProps<E, A>>>
}

export function liftIntrinsic<E extends Element>(
  intrinsicClassName: keyof React.ReactHTML
): LiftedIntrinsic<E> {
  return (props: LiftedIntrinsicComponentProps<E>) =>
    React.createElement<LiftWrapperProps<ObservableReactHTMLProps<E>>>(
      LiftWrapper,
      { component: intrinsicClassName, props: props }
    )
}

export type GenericLiftedIntrinsic<T> =
  T extends React.DetailedHTMLFactory<infer A, infer B>
    ? LiftedIntrinsic<B, A>
    : never

export type LiftedIntrinsicsHTML = {
  readonly [K in keyof React.ReactHTML]: GenericLiftedIntrinsic<React.ReactHTML[K]>
}

export interface LiftedFragmentAttributes extends ObservableReactChildren, React.Attributes {}

export interface LiftedFragment {
  (props: LiftedFragmentAttributes):
    // @TODO this probably isn't a correct type for it
    React.ReactElement<LiftWrapperProps<ObservableReactHTMLProps<{}>>>
}

interface ExtraLiftedIntrinsics {
  readonly Fragment: LiftedFragment
}

export type LiftedIntrinsics = LiftedIntrinsicsHTML & ExtraLiftedIntrinsics

export function createLiftedIntrinsics(): LiftedIntrinsics {
  const html: (keyof LiftedIntrinsicsHTML)[] = [
    'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'big',
    'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
    'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed',
    'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
    'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta',
    'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param',
    'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section',
    'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table',
    'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul',
    'var', 'video', 'wbr'
  ]

  const r: {
    -readonly [P in keyof LiftedIntrinsics]?: LiftedIntrinsics[P];
  } = {}

  html.forEach(e => (r as any)[e] = liftIntrinsic(e))

  r.Fragment = (props: LiftedFragmentAttributes) =>
    React.createElement(LiftWrapper, { component: React.Fragment, props })

  return r as LiftedIntrinsics
}

// @TODO SVG support
