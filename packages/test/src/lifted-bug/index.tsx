import * as React from 'react'
import { F, Atom } from '@grammarly/focal'

const Broken = ({ prop = 0 }) => <F.span>Hello, {prop.toString()}.</F.span>
const Works = ({ prop = 0 }) => <span>Hello, {prop.toString()}.</span>

export const Main = ({ state = Atom.create(0) }) => {
  return (
    <div onClick={() => state.modify(x => x + 1)}>
      <div>
        Hello. (click to break) This bug should now be fixed and all of the labels below should
        report the same number value.
      </div>

      <div>
        <strong>works: </strong>
        <F.span>{state.view(x => `Hello, ${x.toString()}.`)}</F.span>
      </div>

      <div>
        <strong>(was) broken: </strong>
        <F.span>
          {state.view(x => (
            <Broken prop={x} />
          ))}
        </F.span>
      </div>

      <div>
        <strong>(was) broken simpler: </strong>
        <F.span>
          {state.view(x => (
            <F.span>Hello, {x.toString()}.</F.span>
          ))}
        </F.span>
      </div>

      <div>
        <strong>(was) broken-fixed: </strong>
        <F.span>
          {state.view(x => (
            <Works prop={x} />
          ))}
        </F.span>
      </div>

      <div>
        <strong>(was) broken twice: </strong>
        <F.span>
          {state.view(x => (
            <F.span>
              <F.span>Hello, {x.toString()}.</F.span>
            </F.span>
          ))}
        </F.span>
      </div>

      <div>
        <strong>(was) broken thrice: </strong>
        <F.span>
          {state.view(x => (
            <F.span>
              <F.span>
                <F.span>Hello, {x.toString()}.</F.span>
              </F.span>
            </F.span>
          ))}
        </F.span>
      </div>

      <div>
        <strong>also works: </strong>
        <F.span>
          <F.span>{state.view(x => `Hello, ${x.toString()}.`)}</F.span>
        </F.span>
      </div>
    </div>
  )
}

export default {
  Component: Main,
  defaultState: 0
}
