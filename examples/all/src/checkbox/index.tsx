import * as React from 'react'
import { Atom, F, bind, createLogger } from '@grammarly/focal'

export interface AppState {
  checked: boolean
}

export namespace AppState {
  export const defaultState: AppState = {
    checked: false
  }
}

export const App = (props: { state: Atom<AppState> }) =>
  <div>
    <label>
      <F.input
        {...bind({ checked: createLogger(props.state.lens(x => x.checked), 'Checkbox') })}
        type='checkbox'
      />
      Toggle me
    </label>
    <F.p>{props.state.view(x => x.checked ? 'ON' : 'OFF')}</F.p>
  </div>

export default {
  Component: App,
  defaultState: AppState.defaultState
}
