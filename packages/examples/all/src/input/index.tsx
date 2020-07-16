import * as React from 'react'
import { Atom, F, bind } from '@grammarly/focal'

interface AppState {
  entry: string
}

namespace AppState {
  export const defaultState: AppState = {
    entry: 'Hello World'
  }
}

const App = (props: { state: Atom<AppState> }) => (
  <div>
    <F.input {...bind({ value: props.state.lens('entry') })} type="text" />
    <F.p>{props.state.view('entry')}</F.p>
  </div>
)

export default {
  Component: App,
  defaultState: AppState.defaultState
}
