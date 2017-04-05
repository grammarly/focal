import * as React from 'react'
import { Atom } from '@grammarly/focal'
import { F } from '@grammarly/focal-react'
import { App as TodoApp } from '../todos'
import { History, HistoryState } from '../utils/history'
import * as TodosModel from '../todos/model'

interface AppState extends HistoryState<TodosModel.AppState> { }

const App = (props: { state: Atom<AppState> }) => {
  const history = History.create(props.state)

  return (
    <div>
      <div>
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
      <TodoApp state={history.state} />
    </div>
  )
}

export default {
  Component: App,
  defaultState: HistoryState.createDefault(TodosModel.defaultAppState)
}
