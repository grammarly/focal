import * as React from 'react'
import { Observable } from 'rxjs'
import { Atom, F } from '@grammarly/focal'

interface AppState {
  shouldIncrement: boolean
}

namespace AppState {
  export const defaultState: AppState = {
    shouldIncrement: true
  }
}

const App = (props: { state: Atom<AppState> }) =>
  <div>
    <F.div>
      {
        props.state.view(x =>
          <input
            type='submit'
            value={x.shouldIncrement ? 'Stop' : 'Increment'}
            onClick={() => props.state.set({ shouldIncrement: !x.shouldIncrement })}
          />
        )
      }
    </F.div>
    <F.div>
      {
        Observable
          .combineLatest(
            Observable.interval(1000).startWith(0).mapTo(1),
            props.state.view(x => x.shouldIncrement)
          )
          .scan((acc, [val, shouldIncrement]) => shouldIncrement ? acc + val : acc, 0)
      }
    </F.div>
  </div>

export default {
  Component: App,
  defaultState: AppState.defaultState
}
