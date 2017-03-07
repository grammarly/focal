import * as React from 'react'
import { Atom, F, bind } from '@grammarly/focal'

interface AppState {
  range: number
}

namespace AppState {
  export const defaultState: AppState = {
    range: 10
  }
}

const App = (props: { state: Atom<AppState> }) =>
  <div>
    <F.input {...bind({ value: props.state.lens(x => x.range) })} type='range' />
    <F.p>Value: {props.state.view(x => x.range)}</F.p>
  </div>

export default {
  Component: App,
  defaultState: AppState.defaultState
}
