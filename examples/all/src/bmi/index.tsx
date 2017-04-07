import * as React from 'react'
import { Atom, F, bind } from '@grammarly/focal'

interface AppState {
  weight: number,
  height: number
}

namespace AppState {
  export const defaultState: AppState = {
    weight: 70,
    height: 170
  }
}

function getBmi(weight: number, height: number) {
  const heightMeters = height * 0.01
  return Math.round(weight / (heightMeters ** 2))
}

const App = (props: { state: Atom<AppState> }) => {
  const weight = props.state.lens(x => x.weight)
  const height = props.state.lens(x => x.height)
  return (
    <div>
      <div>
        Weight (kg) <F.input {...bind({ value: weight })} type='range' min='40' max='140' />
      </div>
      <div>
        Height (cm) <F.input {...bind({ value: height })} type='range' min='140' max='210' />
      </div>
      <F.h3>
        BMI is { Atom.combine(weight, height, getBmi) }
      </F.h3>
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
