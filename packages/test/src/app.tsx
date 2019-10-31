import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Atom, Lens } from '@grammarly/focal'

interface TestComponent<S> {
  Component: React.StatelessComponent<{ state: Atom<S> }>
  defaultState: S
}

declare var require: (path: string) => any

const tests: { name: string; test: TestComponent<any> }[] = ['lifted-bug', 'render-bug'].map(
  name => {
    return { name, test: require(`./${name}/index.tsx`).default as TestComponent<any> }
  }
)

export const defaultState = {} as any
tests.forEach(ex => {
  defaultState[ex.name] = ex.test.defaultState
})

export const AppComponent = ({ state = Atom.create(defaultState) }) => {
  return (
    <main>
      <h1>Tests</h1>

      {tests.map(test => (
        <section key={test.name}>
          <h2>{test.name}</h2>
          <div>
            <test.test.Component state={state.lens(Lens.key(test.name))} />
          </div>
        </section>
      ))}
    </main>
  )
}

export class App {
  constructor(
    private targetElement: HTMLElement,
    public state: Atom<typeof defaultState> = Atom.create(defaultState)
  ) {
    this.state.subscribe(s => {
      console.log('App state changed: ' + JSON.stringify(s))
    })
  }

  start() {
    ReactDOM.render(<AppComponent state={this.state} />, this.targetElement)
  }
}
