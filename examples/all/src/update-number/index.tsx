import * as React from 'react'
import { Observable } from 'rxjs'
import { Atom, F, bind } from '@grammarly/focal'

interface AppState {
  inputValue: string,
  value: number
}

namespace AppState {
  const defaultValue = 10

  export const defaultState: AppState = {
    inputValue: defaultValue.toString(),
    value: defaultValue
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

function getUpdateNumberObservable(buffer: number[]) {
  const [prev, curr] = buffer
  return Observable
    .timer(0, 20)
    .mapTo(positiveOrNegative(curr, prev))
    .startWith(prev)
    .scan((acc, val) => acc + val)
    .takeWhile(takeUntilFunc(curr, prev))
}

const App = (props: { state: Atom<AppState> }) => {
  const value = props.state.view('value')
  return (
    <div>
      <F.input type='number' {...bind({ value: props.state.lens('inputValue') })} />
      <input
        type='submit'
        value='Update'
        onClick={() => props.state.modify(x => ({ ...x, value: parseInt(x.inputValue, 10) }))}
      />
      <div>
        <h3>Observable.scan</h3>
        <F.span>
          {
            value
              .scan(([_, curr], val) => [curr, val], [0, value.get()])
              .switchMap(getUpdateNumberObservable)
          }
        </F.span>
      </div>
      <div>
        <h3>Observable.bufferCount</h3>
        <F.span>
          {
            value
              .bufferCount(2, 1)
              .switchMap(getUpdateNumberObservable)
              .merge(value.first())
          }
        </F.span>
      </div>
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
