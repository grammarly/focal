import * as React from 'react'
import { Atom } from '@grammarly/focal'
import { F, reactiveList } from '@grammarly/focal-react'

type Status = 'STARTED' | 'STOPPED' | 'RESET'

interface Time {
  seconds: number,
  milliseconds: number,
  minutes: number
}

interface AppState {
  time: Time,
  laps: Time[],
  action: Status
}

const STARTED: Status = 'STARTED'
const STOPPED: Status = 'STOPPED'
const RESET: Status = 'RESET'

namespace AppState {
  export const defaultTimeState: Time = {
    seconds: 0,
    milliseconds: 0,
    minutes: 0
  }

  export const defaultState: AppState = {
    time: defaultTimeState,
    action: RESET,
    laps: []
  }
}

function formatTime(value: number) {
  return (value < 10 ? '0' : '') + value.toString()
}

function getTime(time: Time) {
  return `${formatTime(time.minutes)}:${formatTime(time.seconds)}:${formatTime(time.milliseconds)}`
}

class App extends React.Component<{ state: Atom<AppState> }, {}> {
  private interval: any

  componentWillUnmpunt() {
    this.handleStop()
  }

  handleStart = () => {
    const time = this.props.state.lens(x => x.time)
    this.props.state.lens(x => x.action).set(STARTED)
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
    this.props.state.lens(x => x.action).set(STOPPED)
  }

  handleReset = () => this.props.state.set(AppState.defaultState)

  handleLap = () => this.props.state.modify(x => ({
    ...x,
    laps: [...x.laps, x.time]
  }))

  render() {
    const time = this.props.state.lens(x => x.time)
    const laps = this.props.state.lens(x => x.laps)
    const action = this.props.state.view(x => x.action)
    const isStarted = action.view(x => x === STARTED)

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
              x === STOPPED &&
              <input key='reset' type='submit' value='Reset' onClick={this.handleReset} />
            )
          }
          {
            isStarted.view(x =>
              x && <input key='lap' type='submit' value='Lap' onClick={this.handleLap} />
            )
          }
        </F.p>
        <F.ul>
          {
            reactiveList(
              laps.view(x => x.map((_, index) => index)),
              index => (
                <F.li key={index}>
                  {laps.view(x => x ? 'Lap ' + (index + 1) + ': ' + getTime(x[index]) : '')}
                </F.li>
              )
            )
          }
        </F.ul>
      </div>
    )
  }
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
