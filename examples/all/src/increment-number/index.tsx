import * as React from 'react'
import { Observable } from 'rxjs'
import { Atom, F } from '@grammarly/focal'

interface AppState {
  isRunning: boolean
}

namespace AppState {
  export const defaultState: AppState = {
    isRunning: true
  }
}

const App = (props: { state: Atom<AppState> }) =>
  <div>
    <F.div>
      {
        props.state.view(x =>
          <input
            type='submit'
            value={x.isRunning ? 'Stop' : 'Start'}
            onClick={() => props.state.set({ isRunning: !x.isRunning })}
          />
        )
      }
    </F.div>
    <h4>Observable.combineLatest</h4>
    <F.div>
      {
        Observable
          .combineLatest(
            Observable.interval(1000).startWith(0).mapTo(1),
            props.state.view(x => x.isRunning)
          )
          .scan((acc, [val, shouldIncrement]) => shouldIncrement ? acc + val : acc, 0)
      }
      <br />
      <h4>Observable.switchMap</h4>
      {
        Observable
          .interval(1000)
          .startWith(0)
          .switchMap(() => props.state.view(x => x.isRunning ? 1 : 0))
          .scan((acc, val) => acc + val, 0)
      }
    </F.div>
  </div>

export default {
  Component: App,
  defaultState: AppState.defaultState
}
