import { Atom } from '@grammarly/focal'
import { Observable, Subscription } from 'rxjs'

export enum Status {
  playing,
  pause
}

export interface AppState {
  status: Status
  volume: number
  currentTime: string
  maxDuration: number
}

export const defaultState: AppState = {
  status: Status.pause,
  volume: 5,
  currentTime: '0',
  maxDuration: 0
}

export const audioSrc = 'http://api.audiotool.com/track/volution/play.mp3'

export class AudioModel {
  private audio: HTMLAudioElement
  private durationSubscription: Subscription
  private timeSubscription: Subscription
  private statusSubscription: Subscription
  private volumeSubscription: Subscription
  private currentTimeSubscription: Subscription

  constructor(atom: Atom<AppState>, audioSrc: string) {
    this.audio = new Audio(audioSrc)

    this.durationSubscription = Observable
      .fromEvent(this.audio, 'canplaythrough')
      .subscribe(() =>
        atom.lens('maxDuration').set(this.audio.duration)
      )

    this.timeSubscription = atom
      .view(x => x.status)
      .switchMap(
        x =>
          x === Status.playing
            ? Observable.interval(1000).mapTo(1)
            : Observable.of(0)
      )
      .subscribe(x =>
        atom.modify(y => {
          const newCurTime = parseInt(y.currentTime, 10) + x
          if (newCurTime > this.audio.duration) {
            return {
              ...y,
              currentTime: '0',
              status: Status.pause
            }
          }
          return {
            ...y,
            currentTime: newCurTime.toString()
          }
        })
      )

    this.statusSubscription = atom
      .view(x => x.status)
      .subscribe(
        x => x === Status.playing ? this.audio.play() : this.audio.pause()
      )

    this.volumeSubscription = atom
      .lens('volume')
      .subscribe(x => this.audio.volume = x / 10)

    this.currentTimeSubscription = atom
      .lens('currentTime')
      .subscribe(x => this.audio.currentTime = parseInt(x, 10))
  }

  unsubscribe() {
    this.durationSubscription.unsubscribe()
    this.timeSubscription.unsubscribe()
    this.currentTimeSubscription.unsubscribe()
    this.statusSubscription.unsubscribe()
    this.volumeSubscription.unsubscribe()
  }
}
