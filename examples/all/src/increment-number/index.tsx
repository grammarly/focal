import * as React from 'react'
import { Observable } from 'rxjs'
import { Atom, F } from '@grammarly/focal'

interface AppState {
  isRun: boolean
}

namespace AppState {
  export const defaultState: AppState = {
    isRun: true
  }
}

const App = (props: { state: Atom<AppState> }) =>
  <div>
    <F.div>
      {
        props.state.view(x =>
          <input
            type='submit'
            value={x.isRun ? 'Stop' : 'Start'}
            onClick={() => props.state.set({ isRun: !x.isRun })}
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
            props.state.view(x => x.isRun)
          )
          .scan((acc, [val, shouldIncrement]) => shouldIncrement ? acc + val : acc, 0)
      }
      <br />
      <h4>Observable.switchMap</h4>
      {
        Observable
          .interval(1000)
          .startWith(0)
          .switchMap(() => props.state.view(x => x.isRun ? 1 : 0))
          .scan((acc, val) => acc + val, 0)
      }
    </F.div>
  </div>

export default {
  Component: App,
  defaultState: AppState.defaultState
}
