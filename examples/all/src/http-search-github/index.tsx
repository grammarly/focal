import * as React from 'react'
import { Atom, F, bind, reactiveList } from '@grammarly/focal'

enum ResultKind {
  Success,
  Failure,
  InProgress
}

interface Success<T> { kind: ResultKind.Success, value: T }
interface Failure { kind: ResultKind.Failure, error: any }
interface InProgress { kind: ResultKind.InProgress }

type Result<T> = Success<T> | Failure | InProgress

namespace Result {
  export function success<T>(value: T): Success<T> {
    return {
      kind: ResultKind.Success,
      value
    }
  }

  export function failure(error: any): Failure {
    return {
      kind: ResultKind.Failure,
      error
    }
  }

  export const inProgress: InProgress = { kind: ResultKind.InProgress }
}

interface AppState {
  searchString: string
  result: undefined | Result<{ url: string, name: string }[]>
}

namespace AppState {
  export const defaultState: AppState = {
    result: undefined,
    searchString: ''
  }
}

function runSearch(result: Atom<typeof AppState.defaultState.result>, query: string) {
  result.set(Result.inProgress)

  fetch(`https://api.github.com/search/repositories?q=${query}`)
    .then(res =>
      res.json()
        .then(json => res.status === 200
          ? Promise.resolve(json)
          : Promise.reject(json.message)))
    .then((json: any) =>
      json.items.map((repo: any) => ({
        url: repo.html_url,
        name: repo.full_name
      })))
    .then(r => result.set(Result.success(r)))
    .catch(err => result.set(Result.failure(err)))
}

export const App = (props: { state: Atom<AppState> }) => {
  const result = props.state.lens(x => x.result)
  const repos = result.view(x => x && x.kind === ResultKind.Success ? x.value : [])

  return (
    <div>
      <div>
        <F.input {...bind({ value: props.state.lens(x => x.searchString) })} type='text' />
        <input
          type='submit'
          value='Search'
          onClick={() => runSearch(result, props.state.get().searchString)}
        />
      </div>
      <F.div>
        {
          result.view(r => {
            if (r === undefined) {
              return 'Enter a search query and click "Search"'
            } else {
              switch (r.kind) {
                case ResultKind.InProgress:
                  return 'Searching...'

                case ResultKind.Failure:
                  return `Error: ${r.error}`

                case ResultKind.Success:
                  return 'Search results:'

                default:
                  const _: never = r
                  return undefined
              }
            }
          })
        }
      </F.div>
      <F.ul>
        {
          reactiveList(
            repos.view(x => x.map((_, index) => index)),
            index => (
              <li key={index}>
                <F.a href={repos.view(x => x[index] && x[index].url)}>
                  {repos.view(x => x[index] && x[index].name)}
                </F.a>
              </li>
            )
          )
        }
      </F.ul>
    </div>
  )
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
