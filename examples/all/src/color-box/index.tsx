import * as React from 'react'
import styled from 'styled-components'
import { Atom, F, bind, lift } from '@grammarly/focal'

interface AppState {
  color: string,
  width: string
}

namespace AppState {
  export const defaultState: AppState = {
    color: 'red',
    width: '250'
  }
}

const Box = lift(styled.div`
  padding: 20px;
  width: ${(props: AppState) => props.width}px;
  background: ${(props: AppState) => props.color};
`)

const App = (props: { state: Atom<AppState> }) => {
  const color = props.state.lens(x => x.color)
  const width = props.state.lens(x => x.width)
  return (
    <Box color={color} width={width}>
      Color: <F.input {...bind({ value: color })} type='text' />
      <br />
      <F.input {...bind({ value: width })} type='range' min='200' max='1500' />
      <br />
      <F.span>{width}</F.span>
    </Box>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
