import * as React from 'react'
import { Atom, F, classes } from '@grammarly/focal'
import * as styles from './change-color.css'

const GREEN = 'green'
const RED = 'red'
const BLUE = 'blue'

const NORMAL = 'normal'
const ITALIC = 'italic'
const BOLD = 'bold'

interface AppState {
  style: {
    color: string
    font: string
  }
}

namespace AppState {
  export const defaultState: AppState = {
    style: {
      color: GREEN,
      font: NORMAL
    }
  }
}

const isEqualTo = (expected: string) => (actual: string) => actual === expected

const App = (props: { state: Atom<AppState> }) => {
  const color = props.state.lens('style', 'color')
  const font = props.state.lens('style', 'font')
  return (
    <div>
      <div>
        {
          [GREEN, RED, BLUE].map((x, index) => (
            <label key={index}>
              <F.input
                checked={color.view(isEqualTo(x))}
                onChange={() => color.set(x)}
                type='checkbox'
              />
              {x}
            </label>
          ))
        }
      </div>

      <div>
        {
          [NORMAL, ITALIC, BOLD].map((x, index) => (
            <label key={index}>
              <F.input
                checked={font.view(isEqualTo(x))}
                onChange={() => font.set(x)}
                type='checkbox'
              />
              {x}
            </label>
          ))
        }
      </div>
      <F.p
        {
          ...classes(
            styles.family,
            color.view(x => styles[x]),
            font.view(x => styles[x])
          )
        }
      >
        Some text
      </F.p>
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
