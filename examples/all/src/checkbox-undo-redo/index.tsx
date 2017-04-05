import * as React from 'react'
import { Atom, Lens } from '@grammarly/focal'
import { F, reactiveList } from '@grammarly/focal-react'
import { App as Checkbox, AppState as CheckboxState } from '../checkbox'
import { History, HistoryState } from '../utils/history'

interface AppState extends HistoryState<{
  checkboxes: CheckboxState[]
}> { }

namespace AppState {
  export const defaultState: AppState = HistoryState.createDefault({
    checkboxes: [CheckboxState.defaultState]
  })
}

const App = (props: { state: Atom<AppState> }) => {
  const history = History.create(props.state)
  const checkboxes = history.state.lens(x => x.checkboxes)

  return (
    <div>
      <div>
        <input
          type='submit'
          value='New'
          onClick={() => checkboxes.modify(x => [...x, CheckboxState.defaultState])}
        />
        <F.input
          type='submit'
          value='Undo'
          disabled={history.canUndo}
          onClick={() => history.undo()}
        />
        <F.input
          type='submit'
          value='Redo'
          disabled={history.canRedo}
          onClick={() => history.redo()}
        />
      </div>
      <F.div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {
          reactiveList(
            checkboxes.view(x => x.map((_, index) => index)),
            index => {
              const state = checkboxes
                .lens(Lens.index<CheckboxState>(index))
                .lens(Lens.withDefault(CheckboxState.defaultState))

              return (
                <div style={{ margin: 8 }} key={index}>
                  <input
                    type='submit'
                    value='Remove'
                    onClick={() => checkboxes.modify(x => x.filter((_, i) => i !== index))}
                  />
                  <Checkbox key={index} state={state} />
                </div>
              )
            }
          )
        }
      </F.div>
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
