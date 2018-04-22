import * as React from 'react'
import { Atom, F } from '@grammarly/focal'

interface CounterState {
  readonly count: number
}

interface AppState {
  readonly counter: CounterState
}

namespace AppState {
  export const defaultState: AppState = {
    counter: { count: 0 }
  }
}

const Counter = (props: { count: Atom<number> }) =>
  <F.div>
    You have clicked this button {props.count} time(s).

    <button onClick={() => props.count.modify(x => x + 1)}>
      Click again?
    </button>
  </F.div>

const App = (props: { state: Atom<AppState> }) =>
  <div>
    Hello, world!
    <Counter count={props.state.lens('counter', 'count')} />
  </div>

export default {
  Component: App,
  defaultState: AppState.defaultState
}
