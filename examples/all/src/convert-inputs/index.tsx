import * as React from 'react'
import { Atom } from '@grammarly/focal'
import { F } from '@grammarly/focal-react'

const toFahrenheit = (celsius: number) => celsius * 9 / 5 + 32
const toCelsius = (fahrenheit: number) => (fahrenheit - 32) * 5 / 9

interface AppState {
  celsius: number,
  fahrenheit: number
}

const defaultTemerature = 10

namespace AppState {
  export const defaultState: AppState = {
    celsius: defaultTemerature,
    fahrenheit: toFahrenheit(defaultTemerature)
  }
}

const App = (props: { state: Atom<AppState> }) =>
  <div>
    <p>
      <F.input
        type='number'
        value={props.state.view(x => x.celsius.toString())}
        onChange={e => props.state.set({
          celsius: +e.currentTarget.value,
          fahrenheit: toFahrenheit(+e.currentTarget.value)
        })}
      />°C
    </p>
    <p>
      <F.input
        type='number'
        value={props.state.view(x => x.fahrenheit.toString())}
        onChange={e => props.state.set({
          fahrenheit: +e.currentTarget.value,
          celsius: toCelsius(+e.currentTarget.value)
        })}
      />°F
    </p>
  </div>

export default {
  Component: App,
  defaultState: AppState.defaultState
}
