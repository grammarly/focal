export interface TodoState {
  value: string
  completed: boolean
}

export interface TodoListState {
  [k: string]: TodoState
}

export const SHOW_ALL = 'SHOW_ALL'
export const SHOW_ACTIVE = 'SHOW_ACTIVE'
export const SHOW_COMPLETED = 'SHOW_COMPLETED'

export type ShowMode =
  typeof SHOW_ALL | typeof SHOW_ACTIVE | typeof SHOW_COMPLETED

export interface AppState {
 todos: TodoListState
 value: string
 filter: ShowMode
 nextTodoId: number
}

export const defaultAppState: AppState = {
  todos: {},
  value: '',
  filter: SHOW_ALL,
  nextTodoId: 0
}

export const defaultTodoState: TodoState = {
  value: '',
  completed: false
}

const createTodo = (value: string): TodoState => ({
  ...defaultTodoState,
  value
})

export const addTodo = (state: AppState): AppState => ({
  value: '',
  todos: {
    [state.nextTodoId]: createTodo(state.value),
    ...state.todos
  },
  filter: state.filter,
  nextTodoId: state.nextTodoId + 1
})

export const toggleTodo = (todo: TodoState): TodoState => ({
  ...todo,
  completed: !todo.completed
})

export function filterTodos(todos: TodoListState, filter: ShowMode) {
  switch (filter) {
    case SHOW_ALL:
      return Object.keys(todos)
    case SHOW_ACTIVE:
      return Object.keys(todos).filter(id => !todos[id].completed)
    case SHOW_COMPLETED:
      return Object.keys(todos).filter(id => todos[id].completed)
    default:
      const _: never = filter
      return Object.keys(todos)
  }
}
