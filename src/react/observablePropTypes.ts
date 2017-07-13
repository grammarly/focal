/**
 * This module defines augmented React element/props types that accept
 * observable values.
 *
 * @NOTE:
 * Q: Why doesn't this just use mapped types???
 * A: Mostly because right now it is not possible have an interface that extends
 * a mapped type. Because of that we will have to have generic structural types,
 * which expand to a huge 3MB .d.ts file and slow down VSCode to the point of uselessness.
 *
 * @module
 */
import * as React from 'react'
import { Observable } from 'rxjs/Rx'

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

export interface ObservableReactCSSProperties {
  alignContent?: any
  alignItems?: any
  alignSelf?: any
  alignmentAdjust?: any
  alignmentBaseline?: any
  animationDelay?: any
  animationDirection?: any
  animationIterationCount?: any
  animationName?: any
  animationPlayState?: any
  appearance?: any
  backfaceVisibility?: any
  background?: any
  backgroundAttachment?: 'scroll' | 'fixed' | 'local' | Observable<'scroll' | 'fixed' | 'local'>
  backgroundBlendMode?: any
  backgroundColor?: any
  backgroundComposite?: any
  backgroundImage?: any
  backgroundOrigin?: any
  backgroundPosition?: any
  backgroundRepeat?: any
  baselineShift?: any
  behavior?: any
  border?: any
  borderBottom?: any
  borderBottomColor?: any
  borderBottomLeftRadius?: any
  borderBottomRightRadius?: any
  borderBottomStyle?: any
  borderBottomWidth?: any
  borderCollapse?: any
  borderColor?: any
  borderCornerShape?: any
  borderImageSource?: any
  borderImageWidth?: any
  borderLeft?: any
  borderLeftColor?: any
  borderLeftStyle?: any
  borderLeftWidth?: any
  borderRight?: any
  borderRightColor?: any
  borderRightStyle?: any
  borderRightWidth?: any
  borderSpacing?: any
  borderStyle?: any
  borderTop?: any
  borderTopColor?: any
  borderTopLeftRadius?: any
  borderTopRightRadius?: any
  borderTopStyle?: any
  borderTopWidth?: any
  borderWidth?: any
  bottom?: any
  boxAlign?: any
  boxDecorationBreak?: any
  boxDirection?: any
  boxLineProgression?: any
  boxLines?: any
  boxOrdinalGroup?: any
  boxFlex?: number | Observable<number>
  boxFlexGroup?: number | Observable<number>
  breakAfter?: any
  breakBefore?: any
  breakInside?: any
  clear?: any
  clip?: any
  clipRule?: any
  color?: any
  columnCount?: number | Observable<number>
  columnFill?: any
  columnGap?: any
  columnRule?: any
  columnRuleColor?: any
  columnRuleWidth?: any
  columnSpan?: any
  columnWidth?: any
  columns?: any
  counterIncrement?: any
  counterReset?: any
  cue?: any
  cueAfter?: any
  cursor?: any
  direction?: any
  display?: any
  fill?: any
  fillOpacity?: number | Observable<number>
  fillRule?: any
  filter?: any
  flex?: number | string | Observable<number | string>
  flexAlign?: any
  flexBasis?: any
  flexDirection?: any
  flexFlow?: any
  flexGrow?: number | Observable<number>
  flexItemAlign?: any
  flexLinePack?: any
  flexOrder?: any
  flexShrink?: number | Observable<number>
  float?: any
  flowFrom?: any
  font?: any
  fontFamily?: any
  fontKerning?: any
  fontSize?: number | string | Observable<number | string>
  fontSizeAdjust?: any
  fontStretch?: any
  fontStyle?: any
  fontSynthesis?: any
  fontVariant?: any
  fontVariantAlternates?: any
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder' | number | Observable<'normal' | 'bold' | 'lighter' | 'bolder' | number>
  gridArea?: any
  gridColumn?: any
  gridColumnEnd?: any
  gridColumnStart?: any
  gridRow?: any
  gridRowEnd?: any
  gridRowPosition?: any
  gridRowSpan?: any
  gridTemplateAreas?: any
  gridTemplateColumns?: any
  gridTemplateRows?: any
  height?: any
  hyphenateLimitChars?: any
  hyphenateLimitLines?: any
  hyphenateLimitZone?: any
  hyphens?: any
  imeMode?: any
  layoutGrid?: any
  layoutGridChar?: any
  layoutGridLine?: any
  layoutGridMode?: any
  layoutGridType?: any
  left?: any
  letterSpacing?: any
  lineBreak?: any
  lineClamp?: number | Observable<number>
  lineHeight?: number | string | Observable<number | string>
  listStyle?: any
  listStyleImage?: any
  listStylePosition?: any
  listStyleType?: any
  margin?: any
  marginBottom?: any
  marginLeft?: any
  marginRight?: any
  marginTop?: any
  marqueeDirection?: any
  marqueeStyle?: any
  mask?: any
  maskBorder?: any
  maskBorderRepeat?: any
  maskBorderSlice?: any
  maskBorderSource?: any
  maskBorderWidth?: any
  maskClip?: any
  maskOrigin?: any
  maxFontSize?: any
  maxHeight?: any
  maxWidth?: any
  minHeight?: any
  minWidth?: any
  opacity?: number | Observable<number>
  order?: number | Observable<number>
  orphans?: number | Observable<number>
  outline?: any
  outlineColor?: any
  outlineOffset?: any
  overflow?: any
  overflowStyle?: any
  overflowX?: any
  overflowY?: any
  padding?: any
  paddingBottom?: any
  paddingLeft?: any
  paddingRight?: any
  paddingTop?: any
  pageBreakAfter?: any
  pageBreakBefore?: any
  pageBreakInside?: any
  pause?: any
  pauseAfter?: any
  pauseBefore?: any
  perspective?: any
  perspectiveOrigin?: any
  pointerEvents?: any
  position?: any
  punctuationTrim?: any
  quotes?: any
  regionFragment?: any
  restAfter?: any
  restBefore?: any
  right?: any
  rubyAlign?: any
  rubyPosition?: any
  shapeImageThreshold?: any
  shapeInside?: any
  shapeMargin?: any
  shapeOutside?: any
  speak?: any
  speakAs?: any
  strokeOpacity?: number | Observable<number>
  strokeWidth?: number | Observable<number>
  tabSize?: any
  tableLayout?: any
  textAlign?: any
  textAlignLast?: any
  textDecoration?: any
  textDecorationColor?: any
  textDecorationLine?: any
  textDecorationLineThrough?: any
  textDecorationNone?: any
  textDecorationOverline?: any
  textDecorationSkip?: any
  textDecorationStyle?: any
  textDecorationUnderline?: any
  textEmphasis?: any
  textEmphasisColor?: any
  textEmphasisStyle?: any
  textHeight?: any
  textIndent?: any
  textJustifyTrim?: any
  textKashidaSpace?: any
  textLineThrough?: any
  textLineThroughColor?: any
  textLineThroughMode?: any
  textLineThroughStyle?: any
  textLineThroughWidth?: any
  textOverflow?: any
  textOverline?: any
  textOverlineColor?: any
  textOverlineMode?: any
  textOverlineStyle?: any
  textOverlineWidth?: any
  textRendering?: any
  textScript?: any
  textShadow?: any
  textTransform?: any
  textUnderlinePosition?: any
  textUnderlineStyle?: any
  top?: any
  touchAction?: any
  transform?: any
  transformOrigin?: any
  transformOriginZ?: any
  transformStyle?: any
  transition?: any
  transitionDelay?: any
  transitionDuration?: any
  transitionProperty?: any
  transitionTimingFunction?: any
  unicodeBidi?: any
  unicodeRange?: any
  userFocus?: any
  userInput?: any
  verticalAlign?: any
  visibility?: any
  voiceBalance?: any
  voiceDuration?: any
  voiceFamily?: any
  voicePitch?: any
  voiceRange?: any
  voiceRate?: any
  voiceStress?: any
  voiceVolume?: any
  whiteSpace?: any
  whiteSpaceTreatment?: any
  widows?: number
  width?: any
  wordBreak?: any
  wordSpacing?: any
  wordWrap?: any
  wrapFlow?: any
  wrapMargin?: any
  wrapOption?: any
  writingMode?: any
  zIndex?: 'auto' | number | Observable<'auto' | number>
  zoom?: 'auto' | number | Observable<'auto' | number>
  [propertyName: string]: any
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
