import * as React from 'react'
import { Observable } from 'rxjs'
import { F } from '@grammarly/focal'

const App = () =>
  <F.div>
    {
      Observable
        .interval(1000)
        .startWith(0)
        .map(() => new Date().toString())
    }
  </F.div>

export default {
  Component: App
}
