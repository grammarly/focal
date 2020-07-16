import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Atom } from '@grammarly/focal'
import * as App from './app'

// hot reload support
declare const require: (path: string) => any
declare const module: {
  hot?: { accept(path?: string, callback?: () => void): void }
}

const appState = Atom.create(App.defaultState)

appState.subscribe(s => {
  console.log('App state changed: ', s)
})

// inject app state in global for debugging
;(window as any).appState = appState

function startApp(C: typeof App.AppComponent) {
  const targetEl = document.getElementById('app')
  if (targetEl == null) throw new Error('React app target element not found. Wrong HTML file?')

  ReactDOM.render(<C state={appState} />, targetEl)
}

if (module.hot) {
  module.hot.accept('./app', () => {
    const newAppModule = require('./app') as typeof App
    startApp(newAppModule.AppComponent)
  })
}

startApp(App.AppComponent)
