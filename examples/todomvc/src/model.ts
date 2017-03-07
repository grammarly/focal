import { Atom, Lens } from '@grammarly/focal'

export type TodoItemId = string

export interface TodoItem {
  id: TodoItemId
  title: string
  completed: boolean
}

export type TodoList = { [k: string]: TodoItem }

export interface AppState {
  todos: TodoList
  nextId: number
}

export const defaultState: AppState = {
  todos: {},
  nextId: 0
}

export class AppModel {
  constructor(public state: Atom<AppState>) {
    this.todos = this.state.lens(x => x.todos)
  }

  public readonly todos = this.state.lens(x => x.todos)

  add(title: string) {
    this.state.modify(({ todos, nextId }) => ({
      todos: Object.assign({},
        todos,
        {
          [String(nextId)]: {
            title,
            completed: false,
            id: nextId
          }
        }),
      nextId: nextId + 1
    }))
  }

  delete(id: TodoItemId) {
    this.todos.modify(todos =>
      Object.keys(todos)
        .filter(k => k !== id)
        .reduce((acc, k) => {
          acc[k] = todos[k]
          return acc
        }, {} as TodoList))
  }

  deleteCompleted() {
    this.todos.modify(todos => {
      return Object.keys(todos)
        .filter(k => !todos[k].completed)
        .reduce((acc, k) => {
          acc[k] = todos[k]
          return acc
        }, {} as TodoList)
    })
  }

  toggleAll() {
    return this.todos.lens(
      Lens.create(
        todos => Object.keys(todos).filter(k => !todos[k].completed).length === 0,
        (v: boolean, todos: TodoList) =>
          Object.keys(todos)
            .reduce((acc, k) => {
              acc[k] = { id: todos[k].id, title: todos[k].title, completed: v }
              return acc
          }, {} as TodoList)
      )
    )
  }
}
