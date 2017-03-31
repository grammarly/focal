import * as React from 'react'
import { Atom, Lens } from '@grammarly/focal'
import { F, bind, reactiveList } from '@grammarly/focal-react'
import {
  AppState, TodoState,
  defaultAppState, defaultTodoState,
  addTodo, toggleTodo, filterTodos,
  SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED
} from './model'

const Todo = (props: { id: string, todo: Atom<TodoState> }) => {
  const { todo, id } = props
  const todoStyle = {
    cursor: 'pointer',
    textDecoration: todo.view(x => x.completed ? 'line-through' : 'none')
  }
  return (
    <F.li style={todoStyle} key={id} onClick={() => todo.modify(toggleTodo)}>
      {todo.view(x => x.value)}
    </F.li>
  )
}

const TodoList = (props: { state: Atom<AppState> }) => {
  const todos = props.state.lens(x => x.todos)
  return (
    <F.ul>
      {
        reactiveList(
          props.state.view(x => filterTodos(x.todos, x.filter)),
          id => {
            const todo = todos
              .lens(Lens.key<TodoState>(id))
              .lens(Lens.withDefault(defaultTodoState))
            return <Todo id={id} todo={todo} />
          }
        )
      }
    </F.ul>
  )
}

const Footer = (props: { filter: Atom<string> }) => (
  <div>
    {
      [SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map(value => (
        <a
          key={value}
          href='#'
          style={{ margin: '0 10px 0 0' }}
          onClick={e => {
            e.preventDefault()
            props.filter.set(value)
          }}
        >
          {value.replace('_', ' ')}
        </a>
      ))
    }
  </div>
)

export const App = (props: { state: Atom<AppState> }) =>
  <div>
    <div>
      <F.input {...bind({ value: props.state.lens(x => x.value) })} type='text' />
      <input type='submit' value='Add Todo' onClick={() => props.state.modify(addTodo)} />
    </div>
    <TodoList state={props.state} />
    <Footer filter={props.state.lens(x => x.filter)} />
  </div>

export default {
  Component: App,
  defaultState: defaultAppState
}
