import * as React from 'react'
import { Atom } from '@grammarly/focal'
import { F, bind } from '@grammarly/focal-react'

interface AppState {
  entry: string
}

namespace AppState {
  export const defaultState: AppState = {
    entry: 'Hello World'
  }
}

const App = (props: { state: Atom<AppState> }) =>
  <div>
    <F.input {...bind({ value: props.state.lens(x => x.entry) })} type='text' />
    <F.p>{props.state.view(x => x.entry)}</F.p>
  </div>

export default {
  Component: App,
  defaultState: AppState.defaultState
}
