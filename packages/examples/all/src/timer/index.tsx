import * as React from 'react'
import { of, interval, combineLatest, Subscription } from 'rxjs'
import { mapTo, scan, switchMap } from 'rxjs/operators'
import { Atom, ReadOnlyAtom, F, reactiveList } from '@grammarly/focal'

enum Status {
  STARTED,
  STOPPED,
  RESET
}

interface Time {
  seconds: number
  milliseconds: number
  minutes: number
}

interface AppState {
  time: Time
  laps: Time[]
  status: Status
}

const defaultTimeState: Time = {
  seconds: 0,
  milliseconds: 0,
  minutes: 0
}

namespace AppState {
  export const defaultState: AppState = {
    time: defaultTimeState,
    status: Status.RESET,
    laps: []
  }
}

function formatTime(value: number) {
  return (value < 10 ? '0' : '') + value.toString()
}

function getTime(time: Time) {
  return `${formatTime(time.minutes)}:${formatTime(time.seconds)}:${formatTime(time.milliseconds)}`
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

const Laps = ({ laps }: { laps: ReadOnlyAtom<Time[]> }) =>
  <F.ul>
    {
      reactiveList(
        laps.view(x => x.map((_, index) => index)),
        index => (
          <F.li key={index}>
            {laps.view(x => x[index] ? 'Lap ' + (index + 1) + ': ' + getTime(x[index]) : '')}
          </F.li>
        )
      )
    }
  </F.ul>

class App extends React.Component<{ state: Atom<AppState> }, {}> {
  private _subscription: Subscription

  componentDidMount() {
    const status = this.props.state.view('status')

    this._subscription = combineLatest(
        status.pipe(switchMap(x => x === Status.STARTED ? interval(1).pipe(mapTo(1)) : of(0))),
        status
      ).pipe(
        scan<[number, Status], Time>(
          (time, [val, status]) =>
            status === Status.RESET ? defaultTimeState : updateTime(time, val),
          defaultTimeState
        )
      )
      .subscribe(x => this.props.state.lens('time').set(x))
  }

  componentWillUnmount() {
    this._subscription.unsubscribe()
  }

  render() {
    const { state } = this.props
    const time = state.lens('time')
    const status = state.lens('status')
    const isStarted = status.view(x => x === Status.STARTED)

    return (
      <div>
        <p>
          <F.span>{time.view(getTime)}</F.span>
        </p>
        <F.p>
          {
            isStarted.view(x =>
              x
              ? <input
                  key='stop'
                  type='submit'
                  value='Stop'
                  onClick={() => status.set(Status.STOPPED)}
              />
              : <input
                key='start'
                type='submit'
                value='Start'
                onClick={() => status.set(Status.STARTED)}
              />
            )
          }
          {
            status.view(x =>
              x === Status.STOPPED &&
              <input
                key='reset'
                type='submit'
                value='Reset'
                onClick={() => state.set(AppState.defaultState)}
              />
            )
          }
          {
            isStarted.view(x =>
              x &&
              <input
                key='lap'
                type='submit'
                value='Lap'
                onClick={() => state.modify(x => ({ ...x, laps: [...x.laps, x.time] }))}
              />
            )
          }
        </F.p>
        <Laps laps={state.view('laps')} />
      </div>
    )
  }
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
