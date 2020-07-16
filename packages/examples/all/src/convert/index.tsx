import * as React from 'react'
import { Atom, F, bind } from '@grammarly/focal'

interface AppState {
  temperature: string
}

namespace AppState {
  export const defaultState: AppState = {
    temperature: '10'
  }
}

const App = (props: { state: Atom<AppState> }) => {
  const temperature = props.state.lens('temperature')
  return (
    <div>
      <F.input {...bind({ value: temperature })} type="text" />
      °C is <F.span>{temperature.view(x => (+x * 9) / 5 + 32)}°F</F.span>
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
