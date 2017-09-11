import * as React from 'react'
import { Atom, structEq } from '@grammarly/focal'
import { ObservableReactHTMLProps } from './observablePropTypes'
import { warning, getReactComponentName, DEV_ENV } from './../utils'
import { Observable, ObservableInput } from 'rxjs/Observable'
import { Subscription as RxSubscription } from 'rxjs/Subscription'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/combineLatest'

// a hack required to support the declaration merging of the Atom type and
// Atom namespace in atom/index.ts
//
// if we don't do it, we get the "cannot be named" compiler error.
import { Atom as _Atom } from '@grammarly/focal/src/atom/base' // tslint:disable-line no-unused-vars

export interface Subscription {
  unsubscribe(): void
}

export type Lifted<T> = {
  [K in keyof T]: T[K] | Observable<T[K]>
}

export interface LiftWrapperProps<TProps> {
  component: React.Component<TProps, any>
    | React.StatelessComponent<TProps>
    | React.ComponentClass<TProps>
    | keyof React.ReactHTML
  props: Lifted<TProps>
}

export interface LiftWrapperState {
  renderCache?: React.DOMElement<any, any> | null
  subscription?: Subscription | null
}

/**
 * A wrapper component that allows to use observables for prop values of a
 * given component.
 */
class LiftWrapper<TProps>
    extends React.Component<LiftWrapperProps<TProps>, LiftWrapperState> {
  constructor(props: LiftWrapperProps<TProps>) {
    super(props, LiftWrapper._initState)
  }

  static _initState: LiftWrapperState = {
    renderCache: null,
    subscription: null
  }

  static _endState: LiftWrapperState = {
    subscription: null
  }

  render() {
    return this.state.renderCache || null
  }

  private _subscribe(newProps: LiftWrapperProps<TProps>) {
    const { props, component } = newProps

    let n = 0
    walkObservables(props, () => n += 1)

    switch (n) {
      case 0:
        this.setState({
          subscription: null,
          renderCache: render(component, props)
        })
        break

      // @NOTE original Calmm code below
      // The created object is never used and it looks like that
      // the useful work is done in the constructor.
      // Could this be replaced by a regular closure? Perhaps using
      // a class is an optimization?
      case 1:
        new RenderOne(this, newProps) // tslint:disable-line
        break
      default:
        new RenderMany(this, newProps, n) // tslint:disable-line
        break
    }
  }

  private _unsubscribe() {
    const subscription = this.state ? this.state.subscription : null
    if (subscription)
      subscription.unsubscribe()
  }

  componentWillReceiveProps(newProps: LiftWrapperProps<TProps>) {
    this._unsubscribe()
    this._subscribe(newProps)
  }

  componentWillMount() {
    this._unsubscribe()
    this._subscribe(this.props)
  }

  componentWillUnmount() {
    this._unsubscribe()
    this.setState(LiftWrapper._initState)
  }

  shouldComponentUpdate(
    _newProps: Readonly<LiftWrapperProps<TProps>>,
    newState: Readonly<LiftWrapperState>,
    _newContext: any
  ) {
    return newState.renderCache !== this.state.renderCache
  }
}

// here we only say TProps, but a lifted component
// will also accept a value of Observable<T> for any prop of
// type T.
export type LiftedComponentProps<TProps> = Lifted<TProps> & {
  mount?(el: HTMLElement): void
}

/**
 * 'Lift' a component so it can accept observable values for props.
 *
 * A lifted component will accept a value of Observable<T> for any prop of
 * type T. However, this is not registered in the lifted component prop types
 * in any way (not possible right now), so casting observable values to `any` is
 * required.
 *
 *
 * @example
 * import { lift } from '@grammarly/focal';
 *
 * type HelloComponentProps = { name: string };
 *
 * const HelloComponent = ({ name }: HelloComponentProps) => <div>Hello, {name}.</div>;
 *
 * // normal usage
 * <HelloComponent name='world' />
 *
 * // lifted version of the same component
 * const LiftedHelloComponent = lift(HelloComponent);
 *
 * const observableValue = Observable.of('world'));
 *
 * // using an observable value for prop
 * <LiftedHelloComponent name={observableValue as any} />
 */
export function lift<TProps>(
  component: React.ComponentClass<TProps> | React.StatelessComponent<TProps>
) {
  return (props: LiftedComponentProps<TProps>) =>
    React.createElement<LiftWrapperProps<TProps>>(
      LiftWrapper,
      { component: component, props: props }
    )
}

export interface LiftedIntrinsicComponentProps<E> extends ObservableReactHTMLProps<E> {
  mount?(el: E): void
}

export function liftIntrinsic<E extends Element>(intrinsicClassName: keyof React.ReactHTML) {
  return (props: LiftedIntrinsicComponentProps<E>) =>
    React.createElement<LiftWrapperProps<ObservableReactHTMLProps<E>>>(
      LiftWrapper,
      { component: intrinsicClassName, props: props }
    )
}

const PROP_CHILDREN = 'children'
const PROP_STYLE = 'style'
const PROP_MOUNT = 'mount'
const PROP_REF = 'ref'

/**
 * Walk a React component props object tree, and for each observable prop found,
 * call the supplied action. 'children' and 'style' props are specially treated.
 *
 * @param props React component props
 * @param action action to run for each observable prop
 */
function walkObservables<T>(
  props: Lifted<T>,
  action: (obs: Observable<any>) => void
) {
  for (const key in props) {
    const value = props[key]

    // any observable component property
    if (value instanceof Observable) {
      action(value)

    // 'children' is an array
    } else if (PROP_CHILDREN === key && value instanceof Array) {
      const n = value.length

      for (let i = 0; i < n; ++i) {
        const child = value[i]
        if (child instanceof Observable)
          action(child)
      }

    // 'style' prop
    } else if (PROP_STYLE === key) {
      for (const k in value) {
        const style = value[k]
        if (style instanceof Observable)
          action(style)
      }
    }
  }
}

/**
 * Render a React component with given props and observable prop values.
 *
 * @param class_ React component class
 * @param props component props
 * @param values observable props values, ordered by appearance in flattened tree
 * @returns rendered element
 */
function render<P>(
  class_: React.Component<P, any> | React.StatelessComponent<P>
    | React.ComponentClass<P> | keyof React.ReactHTML,
  props: P,
  observedValues: any[] = []
): React.DOMElement<any, any> {
  const newProps: any = {}
  let newChildren: any
  let k = -1

  // Here we will do exactly the same walk as we did in `walkObservables` when filling
  // out the `values` argument before this function is called. We will also use the value
  // of prop named 'mount' as a value for the 'ref' prop (it is special in React).
  //
  // It is ugly and hacky, but supposedly a space optimization from the original Calmm
  // implementation.
  for (const key in props) {
    const propValue = (props as any)[key]
    const isChildren = key === PROP_CHILDREN
    const isMount = key === PROP_MOUNT
    const isStyle = key === PROP_STYLE

    // prop is an observable
    if (propValue instanceof Observable) {
      const observedValue = observedValues[++k]
      if (isChildren) {
        newChildren = observedValue
      } else if (isMount) {
        newProps.ref = observedValue
      } else {
        newProps[key] = observedValue
      }
    // 'children' prop
    } else if (isChildren) {
      if (propValue instanceof Array) {
        const n = propValue.length

        for (let i = 0; i < n; ++i) {
          const child = propValue[i]
          if (child instanceof Observable) {
            if (!newChildren) {
              newChildren = Array(propValue.length)
              for (let j = 0; j < i; ++j)
                newChildren[j] = propValue[j]
            }
            newChildren[i] = observedValues[++k]
          } else if (newChildren) {
            newChildren[i] = propValue[i]
          }
        }
      }
      newChildren = newChildren || propValue
    // 'mount' prop
    } else if (isMount) {
      newProps.ref = propValue
    // 'style' prop
    } else if (isStyle) {
      let newStyle: any
      for (const i in propValue) {
        const style = propValue[i]
        if (style instanceof Observable) {
          if (!newStyle) {
            newStyle = {}
            for (const j in propValue) {
              if (j === i)
                break
              newStyle[j] = propValue[j]
            }
          }
          newStyle[i] = observedValues[++k]
        } else if (newStyle) {
          newStyle[i] = style
        }
      }
      newProps.style = newStyle || propValue
    // all other (non-liftable) props
    } else {
      newProps[key] = propValue
    }
  }

  return React.createElement(
    class_ as any,
    newProps,
    newChildren === undefined ? null : newChildren
  )
}

/**
 * A dummy React component mock that is used to preserve any state changes
 * pushed onto the component.
 */
class FakeComponent<P> {
  constructor(
    public state: LiftWrapperState,
    public props: LiftWrapperProps<P>
  ) {}

  setState(newState: LiftWrapperState) {
    if ('subscription' in newState)
      this.state.subscription = newState.subscription
    if ('renderCache' in newState)
      this.state.renderCache = newState.renderCache
  }
}

// could make sense to make this configurable
const handleError = (e: any) => {
  throw e
}

function warnEmptyObservable(componentName: string | undefined) {
  warning(
    `${componentName ? `The component <${componentName}>` : 'An unnamed component'} has ` +
    `received an empty observable in one of its props. Since such observable never calls ` +
    `its subscription handler, this component can never be rendered. ` +
    `Check the props of ${componentName ? `<${componentName}>` : 'this component'}.`
  )
}

/**
 * A rendering helper class specialized for the single observable prop case.
 *
 * @template P component props
 */
class RenderOne<P> implements Subscription {
  private _liftedComponent: LiftWrapper<P>
  private _innerSubscription: RxSubscription | null
  private _receivedValue = false

  constructor(
    liftedComponent: LiftWrapper<P>,
    newProps: LiftWrapperProps<P>
  ) {
    const state: LiftWrapperState = {
      subscription: this,
      renderCache: liftedComponent.state && liftedComponent.state.renderCache
    }

    this._liftedComponent =
      new FakeComponent<P>(state, newProps) as LiftWrapper<P>

    walkObservables(
      newProps.props,
      observable => {
        this._innerSubscription = observable.subscribe(
          (v: any) => this._handleValue(v),
          handleError,
          () => this._handleCompleted())

        // observable has completed and unsubscribed by itself
        if (this._innerSubscription && this._innerSubscription.closed)
          this._innerSubscription = null
      })

    this._liftedComponent = liftedComponent
    liftedComponent.setState(state)
  }

  unsubscribe() {
    if (this._innerSubscription)
      this._innerSubscription.unsubscribe()
  }

  private _handleValue(value: any) {
    // only required for empty observable check in _handleCompleted
    this._receivedValue = true

    const liftedComponent = this._liftedComponent
    const { component, props } = liftedComponent.props
    const renderCache = render(component, props, [value])

    if (!structEq(liftedComponent.state.renderCache, renderCache))
      liftedComponent.setState({ renderCache })
  }

  private _handleCompleted() {
    if (!this._receivedValue && DEV_ENV)
      warnEmptyObservable(getReactComponentName(this._liftedComponent.props.component))

    this._innerSubscription = null
    this._liftedComponent.setState(LiftWrapper._endState)
  }
}

/**
 * A rendering helper class specialized for the many observable prop case.
 *
 * @template P component props
 */
class RenderMany<P> implements Subscription {
  private _liftedComponent: LiftWrapper<P>
  private _values: any[]
  private _innerSubscriptions: (RxSubscription | null)[]

  constructor(
    liftedComponent: LiftWrapper<P>,
    newProps: LiftWrapperProps<P>,
    N: number
  ) {
    const state: LiftWrapperState = {
      subscription: this,
      renderCache: liftedComponent.state && liftedComponent.state.renderCache
    }

    this._liftedComponent =
      new FakeComponent(state, newProps) as LiftWrapper<P>

    this._innerSubscriptions = []
    this._values = Array(N)

    for (let i = 0; i < N; ++i)
      this._values[i] = this

    walkObservables(newProps.props, observable => {
      const i = this._innerSubscriptions.length

      let subscription: RxSubscription | null = observable.subscribe(
        (v: any) => this._handleValue(i, v),
        handleError,
        () => this._handleCompleted(i))

      // observable has completed and unsubscribed by itself
      if (subscription && subscription.closed)
        subscription = null

      // handlers are called at subscribe time
      // before unsubscriber was added to this.innerSubscriptions
      this._innerSubscriptions.push(subscription)
    })

    // At this point all handlers should have been called.
    // If that's not the case, then there's an empty observable in one of the
    // props.
    //
    // Since the component can't be rendered until every handler is called at
    // least once, and a handler of an empty observable will never be called,
    // this component will never get rendered.
    if (DEV_ENV)
      for (let i = this._values.length - 1; 0 <= i; --i)
        if (this._values[i] === this) {
          warnEmptyObservable(getReactComponentName(liftedComponent.props.component))
          break
        }

    this._liftedComponent = liftedComponent
    liftedComponent.setState(state)
  }

  unsubscribe() {
    let i = -1
    walkObservables(this._liftedComponent.props.props, _ => {
      const unsubscriber = this._innerSubscriptions[++i]
      if (unsubscriber)
        unsubscriber.unsubscribe()
    })
  }

  private _handleValue(idx: number, value: any) {
    this._values[idx] = value

    // do nothing if at least one of the observables hasn't
    // sent a value yet
    for (let i = this._values.length - 1; 0 <= i; --i)
      if (this._values[i] === this)
        return

    const liftedComponent = this._liftedComponent
    const { component, props } = liftedComponent.props
    const renderCache = render(component, props, this._values)

    if (!structEq(liftedComponent.state.renderCache, renderCache))
      liftedComponent.setState({ renderCache })
  }

  private _handleCompleted(idx: number) {
    const n = this._innerSubscriptions.length

    if (n > idx)
      this._innerSubscriptions[idx] = null

    if (n !== this._values.length)
      return

    for (let i = 0; i < n; ++i)
      if (this._innerSubscriptions[i])
        return

    this._liftedComponent.setState(LiftWrapper._endState)
  }
}

export type ObservableInputLike<T> = T | ObservableInput<T>
export type ObservableLike<T> = T | Observable<T>
export type ClassNameLike = undefined | null | boolean | string

/**
 * Filter out undefined, null, false and empty strings.
 * Throw on a `true` value.
 */
function filterClassNames(
  cs: ObservableInputLike<ClassNameLike>[]
) {
  return cs.filter(c => {
    if (c === true) throw new TypeError('Unexpected `true` value in classes')
    return c !== null && c !== undefined && c !== '' && c !== false
  }) as (string | ObservableInput<ClassNameLike>)[]
}

// tslint:disable no-unused-vars
export function classes(...cs: ClassNameLike[]): { className: string | undefined }

export function classes(
  ...cs: ObservableInputLike<ClassNameLike>[]
): { className: ObservableLike<string | undefined> }
// tslint:enable no-unused-vars

/**
 * Declare element's classes through an array of observables.
 *
 * Each observable defines the presence of a single respective CSS
 * class in the resulting element's class attribute. If this observable's
 * most recent value is a null or undefined, it will not be included in
 * the resulting class attribute value.
 *
 * You can also use this with regular components, but if you have *at least one*
 * observable in the class name list, you will *need* to use a
 * [lifted component]{@link LiftedComponent} only.
 *
 * @example
 * import { Atom, classes } from '@grammarly/focal';
 *
 * const a = Atom.create(null as string);
 * const b = Atom.create(null as string);
 * const c = Atom.create(null as string);
 *
 * const className = classes(a, b, c).className;
 * const sub = className.subscribe(x => console.log(x));
 *
 * // prints ''
 *
 * a.set('one');
 * // prints 'one'
 *
 * b.set('two');
 * // prints 'one two'
 *
 * c.set('three')
 * // prints 'one two three'
 *
 * b.set(null as string);
 * // prints 'one three'
 *
 * a.set(null as string);
 * // prints 'three'
 *
 * sub.unsubscribe();
 * @example
 * import { Atom, classes } from '@grammarly/focal';
 *
 * const c = Atom.create('c');
 *
 * <F.div {...classes(2 > 3 && 'a', 'b', c)}>Hello.</F.div>
 * @returns an object to be spread in a JSX element properties
 */
export function classes(
  ...cs: ObservableInputLike<ClassNameLike>[]
): { className: ObservableLike<string | undefined> | string | undefined } {
  // case w/o observables
  if (!cs || cs.find(x => x instanceof Observable) === undefined) {
    const filtered =
      filterClassNames(
        (cs || []) as ClassNameLike[] // assert ClassNameLike[]: no observables (checked above)
      ) as string[] // assert string[]: no observables (checked above)

    return {
      className: filtered.length > 0
        ? filtered.join(' ')
        : undefined
    }
  // case with observables
  } else {
    return {
      className: Observable.combineLatest(
        filterClassNames(cs || []).map(x =>
          // @TODO optimize: unnecessary Observable.of
          // can we actually already just remove this?
          !(x instanceof Observable) ? Observable.of(x) : x),
        (...cs: ClassNameLike[]) => {
          const filtered = filterClassNames(cs || [])

          return filtered.length > 0
            ? filtered.join(' ')
            : undefined
        }
      )
    }
  }
}

// @TODO this is naїve, can we do better?
function combineTemplate(
  template: { [key: string]: ObservableInput<any> }
): Observable<{ [key: string]: any }> {
  const keys: string[] = []
  const values: ObservableInput<any>[] = []

  for (const k in template) {
    keys.push(k)
    values.push(template[k])
  }

  return Observable.combineLatest(values, (...vs: any[]) => {
    const r: { [key: string]: any } = {}
    for (let i = 0; i < keys.length; i++) {
      r[keys[i]] = vs[i]
    }
    return r
  })
}

/**
 * Creates a callback to be used with a React [ref]{@link React.ClassAttributes#ref}
 * prop to propagate any values in given observable dictionary to
 * respective instance element properties.
 */
export function setElementProps<TElement extends Element>(
  template: { [key: string]: ObservableInput<any> }
) {
  let observable: Observable<{ [key: string]: any }> | null = null
  let subscription: RxSubscription | null = null

  return (domElement: TElement) => {
    if (subscription) {
      subscription.unsubscribe()
      subscription = null
      observable = null
    }

    if (domElement) {
      observable = combineTemplate(template)

      subscription = observable.subscribe(
        value => {
          for (const k in value)
            (domElement as any)[k] = value[k]
        },
        handleError,
        () => {
          observable = null
          subscription = null
        }
      )
    }
  }
}

/**
 * Creates a React event handler that will set the given dictionary of
 * atoms to their respective component property values.
 */
export function getElementProps(template: { [key: string]: Atom<any> }) {
  return (e: React.SyntheticEvent<any>) => {
    for (const k in template) {
      template[k].set((e.target as any)[k])
    }
  }
}

export function bindElementProps(
  // @TODO need to fix the type of { [k: string]: string | Atom<any> }.
  // this function already compiles without the 'string | ...', but it's
  // calls do not.
  template: { ref?: string; mount?: string } & { [k: string]: string | Atom<any> }
) {
  const { [PROP_REF]: ref, [PROP_MOUNT]: mount, ...tpl } = template

  return ref
    ? ({
      [PROP_REF]: setElementProps(tpl),
      [ref]: getElementProps(tpl as { [k: string]: Atom<any> })
    })
    : mount
      ? ({
        [PROP_MOUNT]: setElementProps(tpl),
        [mount]: getElementProps(tpl as { [k: string]: Atom<any> })
      })
      : {}
}

/**
 * Two-way bind component props to respective atoms. Any changes in the
 * atom will then trigger component update, and any change in the component's
 * prop value will be pushed onto the atom.
 *
 * The component is _required_ to be a {@link LiftedComponent}.
 *
 * Your component needs to be lifted.
 *
 * @example
 * import { Atom, F, bind } from '@grammarly/focal';
 *
 * const checked = Atom.create(false);
 *
 * <F.input type='checkbox'
 *          {...bind({ checked })}/>
 * @returns a props object with an `onChange` handler that will handle the two-way binding
 */
export function bind(template: { [key: string]: Atom<any> }) {
  return {
    ...template,
    ...{ onChange: getElementProps(template) }
  }
}

// tslint:disable no-unused-vars
export function reactiveList<TValue>(
  ids: Observable<string[]>, createListItem: (x: string) => TValue
): Observable<TValue[]>

export function reactiveList<TValue>(
  ids: Observable<number[]>, createListItem: (x: number) => TValue
): Observable<TValue[]>
// tslint:enable no-unused-vars

/**
 * Derive a reactive list from:
 * - an observable of list item ids
 * - a list item factory – a function that will create a list item based on item id.
 */
export function reactiveList<TValue>(
  ids: Observable<string[]> | Observable<number[]>,
  createListItem: ((x: string) => TValue) | ((x: number) => TValue)
): Observable<TValue[]> {
  return ids.scan(
    ([oldIds, _]: [any, TValue[]], ids: string[] | number[]) => {
      // @NOTE actual type of oldIds and newIds is either { [k: string]: TValue }
      // or { [k: number]: TValue }, but the type system doesn't allow us to
      // express this.
      const newIds: any = {}
      const newValues: TValue[] = Array(ids.length)
      const n = ids.length

      for (let i = 0; i < n; ++i) {
        const id = ids[i]
        const k = id.toString()
        if (k in newIds) {
          newValues[i] = newIds[k]
        } else {
          newIds[k] = newValues[i] =
            k in oldIds
              ? oldIds[k]
              : (createListItem as (_: string | number) => TValue)(id)
        }
      }
      return [newIds, newValues] as [any, TValue[]]
    },
    [{}, []])
    .map(([_, values]) => values)
}
