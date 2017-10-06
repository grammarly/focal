/**
 * Lifted intrinsic React components that accept observable props.
 *
 * @module
 */
import * as React from 'react'
import { ObservableReactHTMLProps } from './observablePropTypes'
import { LiftWrapperProps, LiftWrapper } from './react'

export interface LiftedIntrinsicComponentProps<E> extends ObservableReactHTMLProps<E> {
  mount?(el: E): void
}

export interface LiftedIntrinsic<E extends Element> {
  (props: LiftedIntrinsicComponentProps<E>):
    React.ReactElement<LiftWrapperProps<ObservableReactHTMLProps<E>>>
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

export interface LiftedIntrinsics {
  readonly a: LiftedIntrinsic<HTMLAnchorElement>
  readonly abbr: LiftedIntrinsic<HTMLElement>
  readonly address: LiftedIntrinsic<HTMLElement>
  readonly area: LiftedIntrinsic<HTMLAreaElement>
  readonly article: LiftedIntrinsic<HTMLElement>
  readonly aside: LiftedIntrinsic<HTMLElement>
  readonly audio: LiftedIntrinsic<HTMLAudioElement>
  readonly b: LiftedIntrinsic<HTMLElement>
  readonly base: LiftedIntrinsic<HTMLBaseElement>
  readonly bdi: LiftedIntrinsic<HTMLElement>
  readonly bdo: LiftedIntrinsic<HTMLElement>
  readonly big: LiftedIntrinsic<HTMLElement>
  readonly blockquote: LiftedIntrinsic<HTMLElement>
  readonly body: LiftedIntrinsic<HTMLBodyElement>
  readonly br: LiftedIntrinsic<HTMLBRElement>
  readonly button: LiftedIntrinsic<HTMLButtonElement>
  readonly canvas: LiftedIntrinsic<HTMLCanvasElement>
  readonly caption: LiftedIntrinsic<HTMLElement>
  readonly cite: LiftedIntrinsic<HTMLElement>
  readonly code: LiftedIntrinsic<HTMLElement>
  readonly col: LiftedIntrinsic<HTMLTableColElement>
  readonly colgroup: LiftedIntrinsic<HTMLTableColElement>
  readonly data: LiftedIntrinsic<HTMLElement>
  readonly datalist: LiftedIntrinsic<HTMLDataListElement>
  readonly dd: LiftedIntrinsic<HTMLElement>
  readonly del: LiftedIntrinsic<HTMLElement>
  readonly details: LiftedIntrinsic<HTMLElement>
  readonly dfn: LiftedIntrinsic<HTMLElement>
  readonly dialog: LiftedIntrinsic<HTMLElement>
  readonly div: LiftedIntrinsic<HTMLDivElement>
  readonly dl: LiftedIntrinsic<HTMLDListElement>
  readonly dt: LiftedIntrinsic<HTMLElement>
  readonly em: LiftedIntrinsic<HTMLElement>
  readonly embed: LiftedIntrinsic<HTMLEmbedElement>
  readonly fieldset: LiftedIntrinsic<HTMLFieldSetElement>
  readonly figcaption: LiftedIntrinsic<HTMLElement>
  readonly figure: LiftedIntrinsic<HTMLElement>
  readonly footer: LiftedIntrinsic<HTMLElement>
  readonly form: LiftedIntrinsic<HTMLFormElement>
  readonly h1: LiftedIntrinsic<HTMLHeadingElement>
  readonly h2: LiftedIntrinsic<HTMLHeadingElement>
  readonly h3: LiftedIntrinsic<HTMLHeadingElement>
  readonly h4: LiftedIntrinsic<HTMLHeadingElement>
  readonly h5: LiftedIntrinsic<HTMLHeadingElement>
  readonly h6: LiftedIntrinsic<HTMLHeadingElement>
  readonly head: LiftedIntrinsic<HTMLHeadElement>
  readonly header: LiftedIntrinsic<HTMLElement>
  readonly hgroup: LiftedIntrinsic<HTMLElement>
  readonly hr: LiftedIntrinsic<HTMLHRElement>
  readonly html: LiftedIntrinsic<HTMLHtmlElement>
  readonly i: LiftedIntrinsic<HTMLElement>
  readonly iframe: LiftedIntrinsic<HTMLIFrameElement>
  readonly img: LiftedIntrinsic<HTMLImageElement>
  readonly input: LiftedIntrinsic<HTMLInputElement>
  readonly ins: LiftedIntrinsic<HTMLModElement>
  readonly kbd: LiftedIntrinsic<HTMLElement>
  readonly keygen: LiftedIntrinsic<HTMLElement>
  readonly label: LiftedIntrinsic<HTMLLabelElement>
  readonly legend: LiftedIntrinsic<HTMLLegendElement>
  readonly li: LiftedIntrinsic<HTMLLIElement>
  readonly link: LiftedIntrinsic<HTMLLinkElement>
  readonly main: LiftedIntrinsic<HTMLElement>
  readonly map: LiftedIntrinsic<HTMLMapElement>
  readonly mark: LiftedIntrinsic<HTMLElement>
  readonly menu: LiftedIntrinsic<HTMLElement>
  readonly menuitem: LiftedIntrinsic<HTMLElement>
  readonly meta: LiftedIntrinsic<HTMLMetaElement>
  readonly meter: LiftedIntrinsic<HTMLElement>
  readonly nav: LiftedIntrinsic<HTMLElement>
  readonly noscript: LiftedIntrinsic<HTMLElement>
  readonly object: LiftedIntrinsic<HTMLObjectElement>
  readonly ol: LiftedIntrinsic<HTMLOListElement>
  readonly optgroup: LiftedIntrinsic<HTMLOptGroupElement>
  readonly option: LiftedIntrinsic<HTMLOptionElement>
  readonly output: LiftedIntrinsic<HTMLElement>
  readonly p: LiftedIntrinsic<HTMLParagraphElement>
  readonly param: LiftedIntrinsic<HTMLParamElement>
  readonly picture: LiftedIntrinsic<HTMLElement>
  readonly pre: LiftedIntrinsic<HTMLPreElement>
  readonly progress: LiftedIntrinsic<HTMLProgressElement>
  readonly q: LiftedIntrinsic<HTMLQuoteElement>
  readonly rp: LiftedIntrinsic<HTMLElement>
  readonly rt: LiftedIntrinsic<HTMLElement>
  readonly ruby: LiftedIntrinsic<HTMLElement>
  readonly s: LiftedIntrinsic<HTMLElement>
  readonly samp: LiftedIntrinsic<HTMLElement>
  readonly script: LiftedIntrinsic<HTMLElement>
  readonly section: LiftedIntrinsic<HTMLElement>
  readonly select: LiftedIntrinsic<HTMLSelectElement>
  readonly small: LiftedIntrinsic<HTMLElement>
  readonly source: LiftedIntrinsic<HTMLSourceElement>
  readonly span: LiftedIntrinsic<HTMLSpanElement>
  readonly strong: LiftedIntrinsic<HTMLElement>
  readonly style: LiftedIntrinsic<HTMLStyleElement>
  readonly sub: LiftedIntrinsic<HTMLElement>
  readonly summary: LiftedIntrinsic<HTMLElement>
  readonly sup: LiftedIntrinsic<HTMLElement>
  readonly table: LiftedIntrinsic<HTMLTableElement>
  readonly tbody: LiftedIntrinsic<HTMLTableSectionElement>
  readonly td: LiftedIntrinsic<HTMLTableDataCellElement>
  readonly textarea: LiftedIntrinsic<HTMLTextAreaElement>
  readonly tfoot: LiftedIntrinsic<HTMLTableSectionElement>
  readonly th: LiftedIntrinsic<HTMLTableHeaderCellElement>
  readonly thead: LiftedIntrinsic<HTMLTableSectionElement>
  readonly time: LiftedIntrinsic<HTMLElement>
  readonly title: LiftedIntrinsic<HTMLTitleElement>
  readonly tr: LiftedIntrinsic<HTMLTableRowElement>
  readonly track: LiftedIntrinsic<HTMLTrackElement>
  readonly u: LiftedIntrinsic<HTMLElement>
  readonly ul: LiftedIntrinsic<HTMLUListElement>
  readonly var: LiftedIntrinsic<HTMLElement>
  readonly video: LiftedIntrinsic<HTMLVideoElement>
  readonly wbr: LiftedIntrinsic<HTMLElement>
}

export function createLiftedIntrinsics(): LiftedIntrinsics {
  const html: (keyof LiftedIntrinsics)[] = [
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

  const r = {} as any
  html.forEach(e => r[e] = liftIntrinsic(e))

  return r as LiftedIntrinsics
}

// @TODO SVG support
