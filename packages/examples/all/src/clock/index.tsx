import * as React from 'react'
import { interval } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { F } from '@grammarly/focal'

const App = () =>
  <F.div>
    {
      interval(1000).pipe(
        startWith(0),
        map(() => new Date().toString()))
    }
  </F.div>

export default {
  Component: App
}
