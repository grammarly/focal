import * as React from 'react'
import { Atom, F, bind, reactiveList } from '@grammarly/focal'

interface AppState {
  values: string[]
  entry: string
}

namespace AppState {
  export const defaultState: AppState = {
    values: [],
    entry: ''
  }
}

function addItem({ values, entry }: AppState): AppState {
  return {
    entry: '',
    values: [entry, ...values]
  }
}

const App = (props: { state: Atom<AppState> }) => {
  const values = props.state.lens(x => x.values)
  return (
    <div>
      <div>
        <F.input { ...bind({ value: props.state.lens(x => x.entry) }) } type='text' />
        <input type='submit' value='Add' onClick={() => props.state.modify(addItem)} />
      </div>
      <F.ul>
        {
          reactiveList(
            values.view(x => x.map((_, index) => index)),
            index => <F.li>{values.view(x => x[index])}</F.li>
          )
        }
      </F.ul>
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
