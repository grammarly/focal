import * as test from 'tape'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import * as React from 'react'
import * as ReactDOM from 'react-dom/server'

import {
  F,
  lift,
  bind,
  Atom,
  reactiveList,
  classes,
  bindElementProps
} from '../src'

class Comp extends React.Component<{ test: string }, {}> {
  render() {
    return (<div>{this.props.test}</div>)
  }
}

function testRender(t: test.Test, actual: JSX.Element | null, expected: string, desc: string) {
  t.is(actual && ReactDOM.renderToStaticMarkup(actual), expected, desc)
}

function fromConst<T>(value: T) {
  return Observable.of(value)
}

test('react', t => {
  testRender(t,
    <F.span>test</F.span>,
    '<span>test</span>',
    'Render F element'
  )

  testRender(t,
    <F.span>{fromConst('test1')}</F.span>,
    '<span>test1</span>',
    'Render F element with oservable'
  )

  testRender(t,
    <F.span style={fromConst({ color: 'red' })}></F.span>,
    '<span style="color:red;"></span>',
    'Render F element with observable in style'
  )

  testRender(t,
    <F.span style={fromConst({ color: 'red' })}>{fromConst('test')}</F.span>,
    '<span style="color:red;">test</span>',
    'Render F element with 2 observables'
  )

  testRender(t,
    <F.span>{Observable.of(0)}</F.span>,
    '<span>0</span>',
    'render single Observable.of(0)'
  )

  t.test('show warning for empty observable', t => {
    (() => {
      let consoleErrorWasCalled: boolean
      const error = console.error
      // tslint:disable-next-line no-function-expression
      console.error = function (message: any) {
        error(message)
        t.is(
          message,
          `[Focal]: The component <span> has received an empty observable ` +
          `in one of its props. Since such observable never calls its ` +
          `subscription handler, this component can never be rendered. ` +
          `Check the props of <span>.`,
          'Focal should print the warning'
        )
        consoleErrorWasCalled = true
      }

      consoleErrorWasCalled = false
      testRender(t,
        <F.span style={fromConst({ color: 'red' })}>{Observable.empty()}</F.span>,
        '',
        'Render empty element with an empty observable'
      )
      t.ok(consoleErrorWasCalled, 'console.error() was called')

      consoleErrorWasCalled = false
      testRender(t,
        <F.span>{Observable.empty()}</F.span>,
        '',
        'Render empty element with a single empty observable'
      )
      t.ok(consoleErrorWasCalled, 'console.error() was called')

      console.error = error
    })()

    t.end()
  })

  testRender(t,
    <F.div onClick={() => { /* no-op */ }} style={{ display: 'block', color: fromConst('red') }}>
      <F.span>Hello</F.span>
    </F.div>,
    '<div style="display:block;color:red;"><span>Hello</span></div>',
    'div with onClick'
  )

  const LiftedComp = lift(Comp)

  testRender(t,
    <LiftedComp test={'hi'} />,
    '<div>hi</div>',
    'lift(Comp) with plain value'
  )

  testRender(t,
    <LiftedComp test={fromConst('hi')} />,
    '<div>hi</div>',
    'lift(Comp) with observable constant'
  )

  testRender(t,
    <LiftedComp test={fromConst('hi')} />,
    '<div>hi</div>',
    'lifted component with observable constant'
  )

  testRender(t,
    <F.a {...bind({})}></F.a>,
    '<a></a>',
    'bind, empty'
  )

  testRender(t,
    <F.a {...bind({ href: Atom.create('test') })} />,
    '<a href="test"></a>',
    'bind, one, constant, one-way'
  )

  testRender(t,
    <F.a {...bind({ href: Atom.create('test'), data: Atom.create('ok') })} />,
    '<a href="test" data="ok"></a>',
    'bind, many, constant, one-way'
  )

  testRender(t,
    <F.ul>
      {reactiveList(
        Atom.create([] as number[]),
        id => <li>{id.toString()}</li>
      )}
    </F.ul>,
    '<ul></ul>',
    'reactive list, empty'
  )

  testRender(t,
    <F.ul>
      {reactiveList(
        Atom.create([1, 2, 3]),
        id => <li key={id}>{id.toString()}</li>
      )}
    </F.ul>,
    '<ul><li>1</li><li>2</li><li>3</li></ul>',
    'reactive list, three items'
  )

  testRender(t,
    <F.tbody>
      {reactiveList(
        Atom.create([1, 2, 3]),
        id =>
          <F.tr key={id}>
            {[1, 2, 3].map(j =>
              <F.td key={j}>
                {id.toString()},{j.toString()}
              </F.td>)}
          </F.tr>
      )}
    </F.tbody>,
    '<tbody><tr><td>1,1</td><td>1,2</td><td>1,3</td></tr><tr><td>2,1</td><td>2,2</td>' +
    '<td>2,3</td></tr><tr><td>3,1</td><td>3,2</td><td>3,3</td></tr></tbody>',
    'reactive list, table'
  )

  testRender(t,
    <F.a {...classes(Atom.create('test'))}></F.a>,
    '<a class="test"></a>',
    'classes, one, constant'
  )

  const [n, m] = [2, 3]

  testRender(t,
    <F.a {...classes(n > m && 'a', Atom.create('b'), 'c', m > n && 'd')}></F.a>,
    '<a class="b c d"></a>',
    'classes, mixed types'
  )

  testRender(t,
    <F.a
      {...classes(
        null,
        n > m && 'a',
        Atom.create(undefined),
        'c',
        m > n && 'd'
      )}
    />,
    '<a class="c d"></a>',
    'classes, more mixed types'
  )

  testRender(t,
    <a {...classes(n > m && 'a', 'b', m > n && 'c')}></a>,
    '<a class="b c"></a>',
    'classes, non-lifted component'
  )

  testRender(t,
    <a {...classes(undefined)}></a>,
    '<a></a>',
    'classes, one undefined constant'
  )

  testRender(t,
    <a {...classes(undefined && 'a', 'b')}></a>,
    '<a class="b"></a>',
    'classes, undefined constant'
  )

  t.assert((() => {
    (
      <F.div {...bindElementProps({ ref: 'onScroll', scrollTop: Atom.create(0) })}></F.div>
    )

    return true
  })(), 'bindElementProps compiles')

  t.end()
})
