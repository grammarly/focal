import * as React from 'react'
import { Observable, BehaviorSubject } from 'rxjs'
import { Time, Status, getTime, defaultTimeState, Laps } from '../timer'
import { Atom, F } from '@grammarly/focal'

interface AppState {
  status: Status,
  laps: Time[]
}

namespace AppState {
  export const defaultState: AppState = {
    status: Status.RESET,
    laps: []
  }
}

function updateTime(time: Time, val: number) {
  let { milliseconds, seconds, minutes } = time
  milliseconds += val
  if (milliseconds === 100) {
    milliseconds = 0
    seconds += 1
  }
  if (seconds === 60) {
    seconds = 0
    minutes += 1
  }
  return { milliseconds, seconds, minutes }
}

const App = (props: { state: Atom<AppState> }) => {
  const status = props.state.lens(x => x.status)
  const isStarted = status.view(x => x === Status.STARTED)
  const bs = new BehaviorSubject(defaultTimeState)
  const time = Observable
    .combineLatest(
      isStarted.switchMap(x => x ? Observable.interval(1).mapTo(1) : Observable.of(0)),
      props.state.view(x => x.status)
    )
    .map(([val, status]) => ({ val, status }))
    .scan((time, { val, status }) =>
      status === Status.RESET ? defaultTimeState : updateTime(time, val),
      defaultTimeState
    )
    .do(x => bs.next(x))
  return (
    <div>
      <F.p>{time.map(getTime)}</F.p>
      <F.p>
        {
          isStarted.view(x =>
            <input
              type='submit'
              value={x ? 'Stop' : 'Start'}
              onClick={() => status.set(x ? Status.STOPPED : Status.STARTED)}
            />
          )
        }
        {
          isStarted.view(x =>
            x &&
            <input
              type='submit'
              value='Laps'
              onClick={() => props.state.lens(x => x.laps).modify(x => [...x, bs.getValue()])}
            />
          )
        }
        {
          status.view(x =>
            x === Status.STOPPED &&
            <input
              type='submit'
              value='Reset'
              onClick={() => props.state.set({ status: Status.RESET, laps: [] })}
            />
          )
        }
      </F.p>
      <Laps laps={props.state.view(x => x.laps)} />
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
