import { App } from './app'
import * as Model from './model'
import { Atom } from '@grammarly/focal'
import { debounceTime } from 'rxjs/operators'

// hot reload support
declare const require: (name: String) => any
declare const module: {
  hot?: { accept(path?: string, callback?: () => void): void }
}

const targetEl = document.getElementById('app')
if (!targetEl)
  throw new Error(`The #app element was not found.
    Make sure you are running the script with a proper HTML page.`)

const LOCALSTORAGE_NAME = 'focal.examples.todomvc'

const defaultState =
  (JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME) || 'null') as (
    | (typeof Model.defaultState)
    | null)) || Model.defaultState

const model = new Model.AppModel(Atom.create(defaultState))

let app = new App(targetEl, model)

model.state.pipe(debounceTime(1000)).subscribe(s => {
  console.log('App state changed: ' + JSON.stringify(s))
  localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(s))
})

if (module.hot) {
  module.hot.accept('./app', () => {
    const newAppModule = require('./app')

    const newApp = new newAppModule.App(targetEl, model)
    app = newApp
    app.start()
  })
}

app.start()

function bench(action: () => void, name: string) {
  const now =
    // tslint:disable-next-line: strict-boolean-expressions
    window.performance && window.performance.now
      ? // tslint:disable-next-line
        function() {
          return window.performance.now()
        }
      : Date.now

  const startTime = now()
  action()
  const endTime = now()
  const syncTime = endTime - startTime

  // tslint:disable
  // no idea what's this for – taken from the Elm benchmark,
  // tslint:disable-next-line
  // https://github.com/evancz/todomvc-perf-comparison/blob/master/resources/benchmark-runner.js#L113
  // tslint:enable
  setTimeout(() => {
    setTimeout(() => {
      const endTime = now()
      console.log(`Benchmark time, '${name}': ${syncTime}, ${endTime - startTime}`)
    }, 0)
  }, 0)
}

// tslint:disable-next-line
;(window as any).benchmark = {
  elm: {
    run: function(numberOfItems = 200) {
      const newTodo = document.getElementsByClassName('new-todo')[0] as HTMLInputElement

      // tslint:disable-next-line
      function elmBenchmark1() {
        for (let i = 0; i < numberOfItems; i++) {
          const keydownEvent = document.createEvent('Event')
          keydownEvent.initEvent('keydown', true, true)

          const e = keydownEvent as any
          e.which = 13 // VK_ENTER
          e.keyCode = 13

          newTodo.value = 'Something to do ' + i
          newTodo.dispatchEvent(keydownEvent)
        }
      }

      function elmBenchmark2() {
        const checkboxes = document.querySelectorAll('.toggle')
        for (let i = 0; i < checkboxes.length; i++) (checkboxes[i] as any).click()
      }

      function elmBenchmark3() {
        const destroyButtons = document.querySelectorAll('.destroy')
        for (let i = 0; i < destroyButtons.length; i++) (destroyButtons[i] as any).click()
      }

      setTimeout(() => {
        bench(elmBenchmark1, 'add items')
        setTimeout(() => {
          bench(elmBenchmark2, 'toggle all items')
          setTimeout(() => {
            bench(elmBenchmark3, 'delete all items')
          }, 50)
        }, 50)
      }, 50)
    }
  },
  om: {
    // tslint:disable
    // @TODO implement Om-like benchmark that only manipulates app state.
    // tslint:disable-next-line
    // see https://github.com/swannodette/todomvc/blob/gh-pages/labs/architecture-examples/om/src/todomvc/app.cljs#L181
    // tslint:enable
  }
}
