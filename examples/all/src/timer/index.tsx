import * as React from 'react'
import { Atom, ReadOnlyAtom, F, reactiveList } from '@grammarly/focal'

export enum Status {
  STARTED,
  STOPPED,
  RESET
}

export interface Time {
  seconds: number,
  milliseconds: number,
  minutes: number
}

interface AppState {
  time: Time,
  laps: Time[],
  action: Status
}

export const defaultTimeState: Time = {
  seconds: 0,
  milliseconds: 0,
  minutes: 0
}

namespace AppState {
  export const defaultState: AppState = {
    time: defaultTimeState,
    action: Status.RESET,
    laps: []
  }
}

function formatTime(value: number) {
  return (value < 10 ? '0' : '') + value.toString()
}

export function getTime(time: Time) {
  return `${formatTime(time.minutes)}:${formatTime(time.seconds)}:${formatTime(time.milliseconds)}`
}

export const Laps = ({ laps }: { laps: ReadOnlyAtom<Time[]> }) =>
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
  private interval: any

  componentWillUnmount() {
    this.handleStop()
  }

  handleStart = () => {
    const time = this.props.state.lens(x => x.time)
    this.props.state.lens(x => x.action).set(Status.STARTED)
    this.interval = setInterval(() => time.modify(x => {
      let { milliseconds, seconds, minutes } = x
      milliseconds += 1
      if (milliseconds === 100) {
        milliseconds = 0
        seconds += 1
      }
      if (seconds === 60) {
        seconds = 0
        minutes += 1
      }
      return { milliseconds, seconds, minutes }
    }), 10)
  }

  handleStop = () => {
    clearInterval(this.interval)
    this.props.state.lens(x => x.action).set(Status.STOPPED)
  }

  handleReset = () => this.props.state.set(AppState.defaultState)

  handleLap = () => this.props.state.modify(x => ({
    ...x,
    laps: [...x.laps, x.time]
  }))

  render() {
    const time = this.props.state.lens(x => x.time)
    const action = this.props.state.view(x => x.action)
    const isStarted = action.view(x => x === Status.STARTED)

    return (
      <div>
        <p>
          <F.span>{time.view(getTime)}</F.span>
        </p>
        <F.p>
          {
            isStarted.view(x =>
              !x && <input key='start' type='submit' value='Start' onClick={this.handleStart} />
            )
          }
          {
            isStarted.view(x =>
              x && <input key='stop' type='submit' value='Stop' onClick={this.handleStop} />
            )
          }
          {
            action.view(x =>
              x === Status.STOPPED &&
              <input key='reset' type='submit' value='Reset' onClick={this.handleReset} />
            )
          }
          {
            isStarted.view(x =>
              x && <input key='lap' type='submit' value='Lap' onClick={this.handleLap} />
            )
          }
        </F.p>
        <Laps laps={this.props.state.view(x => x.laps)} />
      </div>
    )
  }
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
