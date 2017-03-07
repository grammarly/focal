import { Atom } from '@grammarly/focal'

export interface CounterState {
  count: number
  absoluteCount: number
  display: boolean
}

export interface AppState {
  counter: CounterState
}

export const defaultCounterState: CounterState = {
  count: 0,
  absoluteCount: 0,
  display: true
}

export const defaultAppState: AppState = {
  counter: defaultCounterState
}

export function incrementCount(counter: Atom<CounterState>) {
  counter.modify(x => ({
    count: x.count + 1,
    absoluteCount: x.absoluteCount + 1,
    display: x.display
  }))
}

export function shouldHideCounter(count: number) {
  return count > 5
}

export function hideAfterFadeOut(counter: Atom<CounterState>) {
  // check if we still should hide
  if (shouldHideCounter(counter.get().count))
    counter.lens(x => x.display).set(false)
}

export function resetCounter(counter: Atom<CounterState>) {
  counter.lens(x => x.count).set(0)
  counter.lens(x => x.display).set(true)
}
