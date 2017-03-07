import * as React from 'react'
import { F, Atom } from '@grammarly/focal'
import * as Model from './model'

const Counter = ({
  counterState = Atom.create(Model.defaultCounterState)
}) => {
  const count = counterState.view(x => x.count)
  const absoluteCount = counterState.view(x => x.absoluteCount)

  return (
    <div>
      <F.span>
        Count: {count}, abs = {absoluteCount}
      </F.span>
      <button onClick={() => Model.incrementCount(counterState)}>
        +
      </button>
      <button onClick={() => Model.resetCounter(counterState)}>
        reset
      </button>
    </div>
  )
}

const AnimatedDiv = ({
  counterState = Atom.create(Model.defaultCounterState)
}) => {
  const displayState = counterState.lens(x => x.display)
  const count = counterState.view(x => x.count)

  const animDiv = displayState.map(displayState => {
    if (displayState) {
      return (
        <F.div
          style={{
            background: '#f00',
            position: 'absolute',
            opacity: count.view(x => Model.shouldHideCounter(x) ? 0.3 : 1.0),
            left: count.view(x => x * 25),
            transition: 'left 0.5s linear, opacity 1.5s linear'
          }}
          onTransitionEnd={e => {
            if (e.propertyName === 'opacity') {
              Model.hideAfterFadeOut(counterState)
            }
          }}
        >
          <Counter counterState={counterState}/>
        </F.div>
      )
    } else {
      return undefined
    }
  })

  return (
    <F.span>{animDiv}</F.span>
  )
}

const App = ({
  state = Atom.create(Model.defaultAppState)
}) => {
  const counterState = state.lens(x => x.counter)

  return (
    <div>
      <Counter counterState={counterState}/>
      <AnimatedDiv counterState={counterState}/>
    </div>
  )
}

export default {
  Component: App,
  defaultState: Model.defaultAppState
}
