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
import { Observable } from 'rxjs'

export type ObservableOr<T> = Observable<T> | T
export type AcceptObservableValues<T> = { [K in keyof T]: ObservableOr<T[K]> }

export type ObservableReactCSSProperties = AcceptObservableValues<React.CSSProperties>

// tslint:disable max-line-length
export interface ObservableReactDOMAttributes<E> {
  dangerouslySetInnerHTML?: { __html: string; } | Observable<{ __html: string; }>

  children?: React.ReactNode | Observable<React.ReactNode>
  // Clipboard Events
  onCopy?: React.ClipboardEventHandler<E> | Observable<React.ClipboardEventHandler<E>>
  onCut?: React.ClipboardEventHandler<E> | Observable<React.ClipboardEventHandler<E>>
  onPaste?: React.ClipboardEventHandler<E> | Observable<React.ClipboardEventHandler<E>>

  // Composition Events
  onCompositionEnd?: React.CompositionEventHandler<E> | Observable<React.CompositionEventHandler<E>>
  onCompositionStart?: React.CompositionEventHandler<E> | Observable<React.CompositionEventHandler<E>>
  onCompositionUpdate?: React.CompositionEventHandler<E> | Observable<React.CompositionEventHandler<E>>

  // Focus Events
  onFocus?: React.FocusEventHandler<E> | Observable<React.FocusEventHandler<E>>
  onBlur?: React.FocusEventHandler<E> | Observable<React.FocusEventHandler<E>>

  // Form Events
  onChange?: React.FormEventHandler<E> | Observable<React.FormEventHandler<E>>
  onInput?: React.FormEventHandler<E> | Observable<React.FormEventHandler<E>>
  onSubmit?: React.FormEventHandler<E> | Observable<React.FormEventHandler<E>>

  // Image Events
  onLoad?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onError?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>> // also a Media Event

  // Keyboard Events
  onKeyDown?: React.KeyboardEventHandler<E> | Observable<React.KeyboardEventHandler<E>>
  onKeyPress?: React.KeyboardEventHandler<E> | Observable<React.KeyboardEventHandler<E>>
  onKeyUp?: React.KeyboardEventHandler<E> | Observable<React.KeyboardEventHandler<E>>

  // Media Events
  onAbort?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onCanPlay?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onCanPlayThrough?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onDurationChange?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onEmptied?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onEncrypted?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onEnded?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onLoadedData?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onLoadedMetadata?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onLoadStart?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onPause?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onPlay?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onPlaying?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onProgress?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onRateChange?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onSeeked?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onSeeking?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onStalled?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onSuspend?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onTimeUpdate?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onVolumeChange?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>
  onWaiting?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>

  // MouseEvents
  onClick?: React.MouseEventHandler<E> | Observable<React.MouseEventHandler<E>>
  onContextMenu?: React.MouseEventHandler<E> | Observable<React.MouseEventHandler<E>>
  onDoubleClick?: React.MouseEventHandler<E> | Observable<React.MouseEventHandler<E>>
  onDrag?: React.DragEventHandler<E> | Observable<React.DragEventHandler<E>>
  onDragEnd?: React.DragEventHandler<E> | Observable<React.DragEventHandler<E>>
  onDragEnter?: React.DragEventHandler<E> | Observable<React.DragEventHandler<E>>
  onDragExit?: React.DragEventHandler<E> | Observable<React.DragEventHandler<E>>
  onDragLeave?: React.DragEventHandler<E> | Observable<React.DragEventHandler<E>>
  onDragOver?: React.DragEventHandler<E> | Observable<React.DragEventHandler<E>>
  onDragStart?: React.DragEventHandler<E> | Observable<React.DragEventHandler<E>>
  onDrop?: React.DragEventHandler<E> | Observable<React.DragEventHandler<E>>
  onMouseDown?: React.MouseEventHandler<E> | Observable<React.MouseEventHandler<E>>
  onMouseEnter?: React.MouseEventHandler<E> | Observable<React.MouseEventHandler<E>>
  onMouseLeave?: React.MouseEventHandler<E> | Observable<React.MouseEventHandler<E>>
  onMouseMove?: React.MouseEventHandler<E> | Observable<React.MouseEventHandler<E>>
  onMouseOut?: React.MouseEventHandler<E> | Observable<React.MouseEventHandler<E>>
  onMouseOver?: React.MouseEventHandler<E> | Observable<React.MouseEventHandler<E>>
  onMouseUp?: React.MouseEventHandler<E> | Observable<React.MouseEventHandler<E>>

  // Selection Events
  onSelect?: React.ReactEventHandler<E> | Observable<React.ReactEventHandler<E>>

  // Touch Events
  onTouchCancel?: React.TouchEventHandler<E> | Observable<React.TouchEventHandler<E>>
  onTouchEnd?: React.TouchEventHandler<E> | Observable<React.TouchEventHandler<E>>
  onTouchMove?: React.TouchEventHandler<E> | Observable<React.TouchEventHandler<E>>
  onTouchStart?: React.TouchEventHandler<E> | Observable<React.TouchEventHandler<E>>

  // UI Events
  onScroll?: React.UIEventHandler<E> | Observable<React.UIEventHandler<E>>

  // Wheel Events
  onWheel?: React.WheelEventHandler<E> | Observable<React.WheelEventHandler<E>>

  // Animation Events
  onAnimationStart?: React.AnimationEventHandler<E> | Observable<React.AnimationEventHandler<E>>
  onAnimationEnd?: React.AnimationEventHandler<E> | Observable<React.AnimationEventHandler<E>>
  onAnimationIteration?: React.AnimationEventHandler<E> | Observable<React.AnimationEventHandler<E>>

  // Transition Events
  onTransitionEnd?: React.TransitionEventHandler<E> | Observable<React.TransitionEventHandler<E>>
}

export interface ObservableReactHTMLAttributes<E> extends ObservableReactDOMAttributes<E> {
  style?: ObservableReactCSSProperties

  // React-specific Attributes
  defaultChecked?: boolean | Observable<boolean>
  defaultValue?: string | string[] | Observable<string | string[]>

  // Standard HTML Attributes
  accept?: string | Observable<string>
  acceptCharset?: string | Observable<string>
  accessKey?: string | Observable<string>
  action?: string | Observable<string>
  allowFullScreen?: boolean | Observable<boolean>
  allowTransparency?: boolean | Observable<boolean>
  alt?: string | Observable<string>
  async?: boolean | Observable<boolean>
  autoComplete?: string | Observable<string>
  autoFocus?: boolean | Observable<boolean>
  autoPlay?: boolean | Observable<boolean>
  capture?: boolean | Observable<boolean>
  cellPadding?: number | string | Observable<number | string>
  cellSpacing?: number | string | Observable<number | string>
  charSet?: string | Observable<string>
  challenge?: string | Observable<string>
  checked?: boolean | Observable<boolean>
  classID?: string | Observable<string>
  className?: string | Observable<string | undefined>
  cols?: number | Observable<number>
  colSpan?: number | Observable<number>
  content?: string | Observable<string>
  contentEditable?: boolean | Observable<boolean>
  contextMenu?: string | Observable<string>
  controls?: boolean | Observable<boolean>
  coords?: string | Observable<string>
  crossOrigin?: string | Observable<string>
  data?: string | Observable<string>
  dateTime?: string | Observable<string>
  default?: boolean | Observable<boolean>
  defer?: boolean | Observable<boolean>
  dir?: string | Observable<string>
  disabled?: boolean | Observable<boolean>
  download?: any | Observable<any>
  draggable?: boolean | Observable<boolean>
  encType?: string | Observable<string>
  form?: string | Observable<string>
  formAction?: string | Observable<string>
  formEncType?: string | Observable<string>
  formMethod?: string | Observable<string>
  formNoValidate?: boolean | Observable<boolean>
  formTarget?: string | Observable<string>
  frameBorder?: number | string | Observable<number | string>
  headers?: string | Observable<string>
  height?: number | string | Observable<number | string>
  hidden?: boolean | Observable<boolean>
  high?: number | Observable<number>
  href?: string | Observable<string>
  hrefLang?: string | Observable<string>
  htmlFor?: string | Observable<string>
  httpEquiv?: string | Observable<string>
  icon?: string | Observable<string>
  id?: string | Observable<string>
  inputMode?: string | Observable<string>
  integrity?: string | Observable<string>
  is?: string | Observable<string>
  keyParams?: string | Observable<string>
  keyType?: string | Observable<string>
  kind?: string | Observable<string>
  label?: string | Observable<string>
  lang?: string | Observable<string>
  list?: string | Observable<string>
  loop?: boolean | Observable<boolean>
  low?: number | Observable<number>
  manifest?: string | Observable<string>
  marginHeight?: number | Observable<number>
  marginWidth?: number | Observable<number>
  max?: number | string | Observable<number | string>
  maxLength?: number | Observable<number>
  media?: string | Observable<string>
  mediaGroup?: string | Observable<string>
  method?: string | Observable<string>
  min?: number | string | Observable<number | string>
  minLength?: number | Observable<number>
  multiple?: boolean | Observable<boolean>
  muted?: boolean | Observable<boolean>
  name?: string | Observable<string>
  nonce?: string | Observable<string>
  noValidate?: boolean | Observable<boolean>
  open?: boolean | Observable<boolean>
  optimum?: number | Observable<number>
  pattern?: string | Observable<string>
  placeholder?: string | Observable<string>
  poster?: string | Observable<string>
  preload?: string | Observable<string>
  radioGroup?: string | Observable<string>
  readOnly?: boolean | Observable<boolean>
  rel?: string | Observable<string>
  required?: boolean | Observable<boolean>
  reversed?: boolean | Observable<boolean>
  role?: string | Observable<string>
  rows?: number | Observable<number>
  rowSpan?: number | Observable<number>
  sandbox?: string | Observable<string>
  scope?: string | Observable<string>
  scoped?: boolean | Observable<boolean>
  scrolling?: string | Observable<string>
  seamless?: boolean | Observable<boolean>
  selected?: boolean | Observable<boolean>
  shape?: string | Observable<string>
  size?: number | Observable<number>
  sizes?: string | Observable<string>
  span?: number | Observable<number>
  spellCheck?: boolean | Observable<boolean>
  src?: string | Observable<string>
  srcDoc?: string | Observable<string>
  srcLang?: string | Observable<string>
  srcSet?: string | Observable<string>
  start?: number | Observable<number>
  step?: number | string | Observable<number | string>
  summary?: string | Observable<string>
  tabIndex?: number | Observable<number>
  target?: string | Observable<string>
  title?: string | Observable<string>
  type?: string | Observable<string>
  useMap?: string | Observable<string>
  value?: string | string[] | number | Observable<string | string[] | number>
  width?: number | string | Observable<number | string>
  wmode?: string | Observable<string>
  wrap?: string | Observable<string>

  // RDFa Attributes
  about?: string | Observable<string>
  datatype?: string | Observable<string>
  inlist?: any | Observable<any>
  prefix?: string | Observable<string>
  property?: string | Observable<string>
  resource?: string | Observable<string>
  typeof?: string | Observable<string>
  vocab?: string | Observable<string>

  // Non-standard Attributes
  autoCapitalize?: string | Observable<string>
  autoCorrect?: string | Observable<string>
  autoSave?: string | Observable<string>
  color?: string | Observable<string>
  itemProp?: string | Observable<string>
  itemScope?: boolean | Observable<boolean>
  itemType?: string | Observable<string>
  itemID?: string | Observable<string>
  itemRef?: string | Observable<string>
  results?: number | Observable<number>
  security?: string | Observable<string>
  unselectable?: boolean | Observable<boolean>
}

export interface ObservableReactHTMLProps<E>
  extends ObservableReactHTMLAttributes<E>, React.ClassAttributes<E> {
}
