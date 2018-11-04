import { App } from './app'

// hot reload support
declare const require: (name: String) => any
declare const module: {
  hot?: { accept(path?: string, callback?: () => void): void }
}

const targetEl = document.getElementById('app')
let app = new App(targetEl!)

if (module.hot) {
  module.hot.accept('./app', () => {
    const newAppModule = require('./app')

    const newApp = (new newAppModule.App(targetEl , app.state))
    app = newApp
    app.start()
  })
}

app.start()
