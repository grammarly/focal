import * as React from 'react'
import { Atom, F, bind, bindElementProps } from '@grammarly/focal'

interface AppState {
  readonly scrollTop: number
  readonly scrollLeft: number
}

namespace AppState {
  export const defaultState: AppState = {
    scrollTop: 0,
    scrollLeft: 0
  }
}

const pattern = `
                         ..,co88oc.oo8888cc,..
   o8o.               ..,o8889689ooo888o"88888888oooc..
 .88888             .o888896888".88888888o'?888888888889ooo....
 a888P          ..c6888969""..,"o888888888o.?8888888888"".ooo8888oo.
 088P        ..atc88889"".,oo8o.86888888888o 88988889",o888888888888.
 888t  ...coo688889"'.ooo88o88b.'86988988889 8688888'o8888896989^888o
  888888888888"..ooo888968888888  "9o688888' "888988 8888868888'o88888
   ""G8889""'ooo888888888888889 .d8o9889""'   "8688o."88888988"o888888o .
            o8888'""""""""""'   o8688"          88868. 888888.68988888"o8o.
            88888o.              "8888ooo.        '8888. 88888.8898888o"888o.
            "888888'               "888888'          '""8o"8888.8869888oo8888o .
       . :.:::::::::::.: .     . :.::::::::.: .   . : ::.:."8888 "888888888888o
                                                         :..8888,. "88888888888.
                                                         .:o888.o8o.  "866o9888o
                                                          :888.o8888.  "88."89".
                                                         . 89  888888    "88":.
                                                         :.     '8888o
                                                          .       "8888..
                                                                    888888o.
                                                                     "888889,
                                                              . : :.:::::::.: :.
`

const Scroller = (props: { scrollTop: Atom<number>, scrollLeft: Atom<number> }) =>
  <div
    {
      ...bindElementProps({
        ref: 'onScroll',
        scrollTop: props.scrollTop,
        scrollLeft: props.scrollLeft
      })
    }
    style={{
      display: 'inline-block',
      overflow: 'scroll',
      height: '10em',
      width: '10em'
    }}
  >
    <pre>{pattern}</pre>
  </div>

const ScrollInput = (props: { value: Atom<number>, label: string }) =>
  <div>
    <label>
      {props.label}
      <F.input {...bind({ value: props.value })} type='number' />
    </label>
  </div>

const App = (props: { state: Atom<AppState> }) => {
  const scrollTop = props.state.lens(x => x.scrollTop)
  const scrollLeft = props.state.lens(x => x.scrollLeft)

  return (
    <div>
      <div>
        <Scroller scrollTop={scrollTop} scrollLeft={scrollLeft} />
        <Scroller scrollTop={scrollTop} scrollLeft={scrollLeft} />
      </div>
      <div>
        <ScrollInput value={scrollTop} label='y' />
        <ScrollInput value={scrollLeft} label='x' />
      </div>
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
