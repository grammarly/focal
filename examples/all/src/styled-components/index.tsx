import * as React from 'react'
import styled from 'styled-components'
import { Atom, bind, lift, createLogger } from '@grammarly/focal'

interface AppState {
  entry: string
}

namespace AppState {
  export const defaultState: AppState = {
    entry: 'Hello World'
  }
}

const Input = lift(styled.input`
  width: 100%;
  height: 20px;
  padding: 2px 0px;
  font-size: 15px;
  text-align: center;
`)

const Text = lift(styled.p`
  width: 100%;
  height: 20px;
  font-size: 15px;
  text-align: center;
`)

const App = (props: { state: Atom<AppState> }) =>
  <div>
    <Input
      {...bind({ value: createLogger(props.state.lens(x => x.entry), 'Intput') })}
      type='text'
    />
    <Text>{props.state.view(x => x.entry)}</Text>
  </div>

export default {
  Component: App,
  defaultState: AppState.defaultState
}
