import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { fromEvent, defer } from 'rxjs'
import { combineLatest, map, startWith } from 'rxjs/operators'
import { F, Atom, Lens, bind, reactiveList, classes } from '@grammarly/focal'
import { TodoItem, AppModel } from './model'

const locationHash = defer(() =>
  fromEvent(window, 'hashchange').pipe(
    map(() => window.location.hash),
    startWith(window.location.hash)
  )
)

// @TODO would be cool to use existing property lenses in place of filters,
// as they do in Calmm. Needs research.
const routes = [
  { hash: '#/', filter: () => true, title: 'All' },
  { hash: '#/active', filter: (x: TodoItem) => !x.completed, title: 'Active' },
  { hash: '#/completed', filter: (x: TodoItem) => x.completed, title: 'Completed' }
]

const route = locationHash.pipe(map(h => routes.find(r => r.hash === h) || routes[0]))

interface TodoProps {
  readonly todo: Atom<TodoItem | undefined>
  readonly editing: Atom<boolean>
  remove(): void
}

const Todo = ({ todo, editing, remove }: TodoProps) => (
  <F.li
    {...classes(todo.view(x => x && x.completed && 'completed'), editing.view(x => x && 'editing'))}
  >
    <F.input
      key="toggle"
      className="toggle"
      type="checkbox"
      hidden={editing.view(item => item)}
      {...bind({
        checked: todo.lens(
          Lens.create(
            (x: TodoItem | undefined) => x && x.completed,
            (v: boolean, x) => x && { ...x, completed: v }
          )
        )
      })}
    />

    <F.label className="view" onDoubleClick={() => editing.set(true)}>
      {todo.view(x => x && x.title)}
    </F.label>
    <button className="destroy" onClick={remove} />

    {editing.view(e => {
      if (e) {
        const focus = (e: HTMLInputElement) => {
          e.focus()
          e.selectionStart = e.value.length
        }

        const exit = () => editing.set(false)

        const save = (e: React.SyntheticEvent<HTMLInputElement>) => {
          const newTitle = e.currentTarget.value.trim()
          exit()
          if (newTitle) {
            todo
              .lens(
                Lens.create(
                  (x: TodoItem | undefined) => x && x.title,
                  (v: string, x) => x && { ...x, title: v }
                )
              )
              .set(newTitle)
          } else {
            remove()
          }
        }

        return (
          <F.input
            className="edit"
            type="text"
            onBlur={save}
            key="x"
            mount={x => x && focus(x)}
            defaultValue={todo.view(x => (x && x.title) || '')}
            onKeyDown={e => (e.key === 'Enter' && save(e)) || (e.key === 'Escape' && exit())}
          />
        )
      } else {
        return false
      }
    })}
  </F.li>
)

const NewTodo = ({ onEntry }: { onEntry(title: string): void }) => {
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const title = (e.target as HTMLInputElement).value.trim()
    if (e.which === 13 && title !== '') {
      onEntry(title)
      ;(e.target as HTMLInputElement).value = ''
    }
  }

  return (
    <input
      className="new-todo"
      type="text"
      autoFocus
      placeholder="What needs to be done?"
      onKeyDown={onKeyDown}
    />
  )
}

const Filters = () => (
  <ul className="filters">
    {routes.map(r => (
      <li key={r.title}>
        <F.a {...classes(route.pipe(map(c => c.hash === r.hash && 'selected')))} href={r.hash}>
          {r.title}
        </F.a>
      </li>
    ))}
  </ul>
)

const AppComponent = ({ model }: { model: AppModel }) => {
  return (
    <div>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <NewTodo onEntry={title => model.add(title)} />
        </header>

        <section className="main">
          <F.input
            type="checkbox"
            className="toggle-all"
            hidden={model.todos.view(x => !x || Object.keys(x).length === 0)}
            {...bind({ checked: model.toggleAll() })}
          />
          <F.ul className="todo-list">
            {reactiveList(
              route.pipe(
                combineLatest(model.todos, (r, xs) => Object.keys(xs).filter(k => r.filter(xs[k])))
              ),
              id => (
                <Todo
                  key={id}
                  todo={model.todos.lens(Lens.key<TodoItem>(id))}
                  remove={() => model.delete(id)}
                  editing={Atom.create(false)}
                />
              )
            )}
          </F.ul>
        </section>

        <F.footer
          className="footer"
          hidden={model.todos.view(x => !x || Object.keys(x).length === 0)}
        >
          <F.span className="todo-count">
            {model.todos.view(xs => {
              const activeCount = Object.keys(xs).filter(k => !xs[k].completed).length
              return `${activeCount} item${activeCount === 1 ? '' : 's'} left`
            })}
          </F.span>

          <Filters />

          <F.button
            className="clear-completed"
            onClick={() => model.deleteCompleted()}
            hidden={model.todos.view(items => {
              const keys = Object.keys(items)
              return keys.length === keys.filter(k => !items[k].completed).length
            })}
          >
            Clear completed
          </F.button>
        </F.footer>
      </section>

      <footer className="info">
        <p>Double-click to edit a todo</p>
        <p>
          <a href="https://github.com/grammarly/focal">GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export class App {
  constructor(private _targetElement: HTMLElement, private _model: AppModel) {}

  start() {
    ReactDOM.render(<AppComponent model={this._model} />, this._targetElement)
  }
}
