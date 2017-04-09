import * as React from 'react'
import { Observable } from 'rxjs'
import { Atom, F } from '@grammarly/focal'

interface AppState {
  value: number
}

namespace AppState {
  export const defaultState: AppState = {
    value: 0
  }
}

function takeUntilFunc(endRange: number, currentNumber: number) {
  return endRange > currentNumber
    ? (val: number) => val <= endRange
    : (val: number) => val >= endRange
}

function positiveOrNegative(endRange: number, currentNumber: number) {
  return endRange > currentNumber ? 1 : -1
}

const App = (props: { state: Atom<AppState> }) => {
  let currentNumber = props.state.get().value
  let input: HTMLInputElement | null = null
  return (
  <div>
    <input
      type='number'
      defaultValue={currentNumber.toString()}
      ref={ref => input = ref}
    />
    <input
      type='submit'
      value='Update'
      onClick={() => input && props.state.set({ value: parseInt(input.value, 10) })}
    />
    <F.div>
      {
        props.state
          .view(x => x.value)
          .switchMap(endRange => Observable
            .timer(0, 20)
            .mapTo(positiveOrNegative(endRange, currentNumber))
            .startWith(currentNumber)
            .scan((acc, curr) => acc + curr)
            .takeWhile(takeUntilFunc(endRange, currentNumber))
          )
          .do(v => currentNumber = v)
          .startWith(currentNumber)
      }
    </F.div>  
  </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
