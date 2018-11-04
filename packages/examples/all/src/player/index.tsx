import * as React from 'react'
import { F, Atom, ReadOnlyAtom, bind } from '@grammarly/focal'
import { Status, AudioModel, AppState, audioSrc, defaultState } from './model'

const Volume = ({ volume }: { volume: Atom<number> }) => (
  <div>
    <F.input
      type='submit'
      value='+'
      disabled={volume.view(x => x >= 10)}
      onClick={() => volume.modify(x => x + 1)}
    />
    <F.input
      type='submit'
      value='-'
      disabled={volume.view(x => x <= 0)}
      onClick={() => volume.modify(x => x - 1)}
    />
    <F.span>{volume}</F.span>
  </div>
)

const Play = ({ status }: { status: Atom<Status> }) => (
  <F.input
    type='submit'
    value={status.view(x => (x === Status.playing ? 'Stop' : 'Play'))}
    onClick={() =>
      status.modify(
        x => (x === Status.playing ? Status.pause : Status.playing)
      )}
  />
)

const TimeLine = ({
  currentTime,
  maxDuration
}: {
  currentTime: Atom<string>,
  maxDuration: ReadOnlyAtom<number>
}) => (
  <div>
    <F.input
      type='range'
      {...bind({ value: currentTime })}
      min={0}
      max={maxDuration}
    />
    <F.span>{currentTime}s</F.span>
  </div>
)

class App extends React.Component<{ state: Atom<AppState> }, {}> {
  audioModel: AudioModel

  componentWillMount() {
    this.audioModel = new AudioModel(this.props.state, audioSrc)
  }

  componentWillUnmount() {
    this.audioModel.unsubscribe()
  }

  render() {
    const { state } = this.props
    return (
      <div>
        <TimeLine
          currentTime={state.lens(x => x.currentTime)}
          maxDuration={state.view(x => x.maxDuration)}
        />
        <Volume volume={state.lens(x => x.volume)} />
        <Play status={state.lens(x => x.status)} />
      </div>
    )
  }
}

export default {
  Component: App,
  defaultState: defaultState
}
