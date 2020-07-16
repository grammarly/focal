import { timer } from 'rxjs'
import {
  takeWhile,
  scan,
  startWith,
  mapTo,
  switchMap,
  bufferCount,
  merge,
  first
} from 'rxjs/operators'
import * as React from 'react'
import { Atom, F, bind } from '@grammarly/focal'

interface AppState {
  inputValue: string
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
  return timer(0, 20).pipe(
    mapTo(positiveOrNegative(curr, prev)),
    startWith(prev),
    scan((acc, val) => acc + val),
    takeWhile(takeUntilFunc(curr, prev))
  )
}

const App = (props: { state: Atom<AppState> }) => {
  const value = props.state.view('value')
  return (
    <div>
      <F.input type="number" {...bind({ value: props.state.lens('inputValue') })} />
      <input
        type="submit"
        value="Update"
        onClick={() => props.state.modify(x => ({ ...x, value: parseInt(x.inputValue, 10) }))}
      />
      <div>
        <h3>Observable.scan</h3>
        <F.span>
          {value.pipe(
            scan(([_, curr], val) => [curr, val], [0, value.get()]),
            switchMap(getUpdateNumberObservable)
          )}
        </F.span>
      </div>
      <div>
        <h3>Observable.bufferCount</h3>
        <F.span>
          {value.pipe(
            bufferCount(2, 1),
            switchMap(getUpdateNumberObservable),
            merge(value.pipe(first()))
          )}
        </F.span>
      </div>
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
