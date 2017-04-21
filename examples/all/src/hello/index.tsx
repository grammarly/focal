import * as React from 'react'
import { Atom, F, bind } from '@grammarly/focal'

interface AppState {
  firstName: string,
  lastName: string
}

namespace AppState {
  export const defaultState: AppState = {
    firstName: '',
    lastName: ''
  }
}

const App = (props: { state: Atom<AppState> }) => {
  const firstName = props.state.lens(x => x.firstName)
  const lastName = props.state.lens(x => x.lastName)
  return (
    <div>
      First Name: <F.input {...bind({ value: firstName })} type='text' />
      <br />
      Last Name: <F.input {...bind({ value: lastName })} type='text' />
      <br />
      <F.h3>
      {
        Atom.combine(
          firstName,
          lastName,
          (x, y) => x.length > 0 && y.length > 0 && `Hello, ${x} ${y}`
        )
      }
      </F.h3>
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
