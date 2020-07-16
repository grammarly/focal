import * as React from 'react'
import { Atom, F } from '@grammarly/focal'
import { Observable, Subject } from 'rxjs'

class Test extends React.Component<{ trigger: Observable<void> }> {
  list = Atom.create(['a', 'b', 'c'])

  componentWillMount() {
    this.props.trigger.subscribe(list => {
      this.list.set(['a', 'b'])
      this.list.set(['a', 'b', 'c'])
    })
  }

  render() {
    return (
      <>
        <h4>Focal</h4>
        <F.ul>
          {this.list.view(list => {
            return list.map(l => <li key={l}>{l}</li>)
          })}
        </F.ul>
      </>
    )
  }
}

class Test2 extends React.Component<{ trigger: Observable<void> }, { list: string[] }> {
  constructor(props: any) {
    super(props)
    this.state = {
      list: ['a', 'b', 'c']
    }
  }

  componentDidMount() {
    this.props.trigger.subscribe(() => {
      this.setState({ list: ['a', 'b'] })
      this.setState({ list: ['a', 'b', 'c'] })
    })
  }

  render() {
    const { list } = this.state
    return (
      <>
        <h4>React</h4>
        <ul>
          {list.map(l => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </>
    )
  }
}

const trigger = new Subject<void>()

function onClick() {
  trigger.next()
}

const App = () => (
  <div>
    <input type="button" onClick={onClick} value="Click me" />
    <Test trigger={trigger} />
    <Test2 trigger={trigger} />
  </div>
)

export default {
  Component: App,
  defaultState: 0
}
