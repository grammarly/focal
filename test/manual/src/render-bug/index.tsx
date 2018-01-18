import * as React from 'react'
import { F, Atom } from '@grammarly/focal'
// @TODO nasty hack, fix instanceof Observable check instead
import { Observable } from '../../node_modules/@grammarly/focal/node_modules/rxjs'

let globalCounter = 0

function mkName() {
  return (++globalCounter).toString()
}

const El = ({ text = '', ts = '' }) => {
  return <F.div>
    El #{text} (render #{ts})
    {Observable.of(undefined)}
  </F.div>
}

const ElWithHover = ({ text = '' }) => {
  const ts = mkName()
  console.log('RENDERED', ts)

  const hovered = Atom.create(false)

  return <F.div
    onMouseEnter={() => hovered.set(true)}
    onMouseLeave={() => hovered.set(false)}
  >
    El #{text} (render #{ts}) is&nbsp;
    {hovered.view(x => {
      console.log('VIEW', ts, x)
      return x ? 'hovered' : 'NOT hovered'
    })}
  </F.div>
}

const MinimalReproduce = () => {
  const state = Atom.create([0])

  return <F.div>
    <h2>The hover does not work after you add an item</h2>

    <button onClick={_ => state.modify(s => ([] as number[]).concat(s.concat([s.length])))}>
      add item
    </button>

    {state.view(xs =>
      xs.map((text, i) =>
        <ElWithHover key={i} text={text.toString()} />
    ))}

    <h2>Simplified</h2>

    {state.view(xs =>
      xs.map((text, i) => {
        const ts = mkName()
        return <El key={i} text={text.toString()} ts={ts} />
      }))}

  </F.div>
}

export const Main = ({
  state = Atom.create(0)
}) => {
  return (
    <MinimalReproduce />
  )
}

export default {
  Component: Main,
  defaultState: 0
}
