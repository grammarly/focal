import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Atom, Lens } from '@grammarly/focal'

interface ExampleComponent<S> {
  Component: React.StatelessComponent<{ state: Atom<S> }>
  defaultState: S
}

declare var require: (path: string) => any

const examples: { name: string, example: ExampleComponent<any> }[] = [
  'counter',
  'clock',
  'checkbox',
  'change-color',
  'checkbox-undo-redo',
  'slider',
  'convert',
  'input',
  'convert-inputs',
  'hello',
  'list-search',
  'scroll',
  'bmi',
  'add-input',
  'todos',
  'todos-with-undo',
  'http-search-github',
  'styled-components',
  'color-box',
  'increment-number',
  'update-number',
  'timer',
  'observable-timer',
  'tree',
  'big-table',
  'animated-counter'
].map(name => {
  return {
    name,
    example: require(`./${name}/index.tsx`).default as ExampleComponent<any>
  }
})

export const defaultState: { [k: string]: any } = {}
examples.forEach(ex => {
  defaultState[ex.name] = ex.example.defaultState
})

export const AppComponent = ({
  state = Atom.create(defaultState)
}) => {

  return (
    <main>
      <h1>Focal examples</h1>

      {examples.map(example => (
        <section key={example.name}>
          <h2>{example.name}</h2>
          <div>
            <example.example.Component state={state.lens(Lens.key(example.name))} />
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
    this.state.subscribe(s => console.log('App state changed: ', s))
  }

  start() {
    ReactDOM.render(
      <AppComponent state={this.state}/>,
      this.targetElement
    )
  }
}
