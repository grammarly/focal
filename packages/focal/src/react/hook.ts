
import * as React from 'react'
import { Subscription } from 'rxjs'
import { walkObservables, render, handleError, LiftWrapperProps } from './react'
import { structEq } from './../utils'

export const LiftHook = <TProps>(newProps: LiftWrapperProps<TProps>) => {
  const [
    renderCacheState,
    setRenderCacheState
  ] = React.useState<React.DOMElement<any, any> | null>(null)

  React.useEffect(() => {
    let innerSubscription: Subscription
    let n = 0

    walkObservables(newProps.props, () => n += 1)

    const renderOne = () => {
      return walkObservables(
        newProps.props,
        observable => {
          innerSubscription = observable.subscribe(
            (value: any) => {
              const renderCache = render(newProps.component, newProps.props, [value])

              if (!structEq(renderCacheState, renderCache))
                setRenderCacheState(renderCache)
            },
            handleError,
            () => {
              if (innerSubscription) {
                innerSubscription.unsubscribe()
              }
            })
        })
    }

    const renderMany = () => {
      const innerSubscriptions: Subscription[] = []
      const values = Array(n).fill(null)

      return walkObservables(
        newProps.props,
        observable => {
        const i = innerSubscriptions.length

        const subscription: Subscription | null = observable.subscribe(
          (value: any) => {
            values[i] = value

            for (let j = values.length - 1; 0 <= j; --j)
              if (values[j] === null)
                return

            const renderCache = render(newProps.component, newProps.props, values)

            if (!structEq(renderCacheState, renderCache))
              setRenderCacheState(renderCache)
          },
          handleError,
          () => {
            if (innerSubscriptions[i]) {
              innerSubscriptions[i].unsubscribe()
            }
          })

        innerSubscriptions.push(subscription)
      })
    }

    if (n === 0) {
     setRenderCacheState(render(newProps.component, newProps.props))
    }
    if (n === 1) {
      return renderOne()
    } else {
      return renderMany()
    }
  }, [newProps.component, newProps.props])

  return renderCacheState
}
