import { of, EMPTY, NEVER } from 'rxjs'
import { map, throttleTime } from 'rxjs/operators'
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

function testRender(actual: JSX.Element | null, expected: string, desc: string) {
  it(desc, () => expect(actual && ReactDOM.renderToStaticMarkup(actual)).toEqual(expected))
}

describe('react', () => {
  testRender(
    <F.span>test</F.span>,
    '<span>test</span>',
    'Render F element'
  )

  testRender(
    <F.span>{of('test1')}</F.span>,
    '<span>test1</span>',
    'Render F element with oservable'
  )

  testRender(
    <F.span style={of({ color: 'red' })}></F.span>,
    '<span style="color:red"></span>',
    'Render F element with observable in style'
  )

  testRender(
    <F.span style={of({ color: 'red' })}>{of('test')}</F.span>,
    '<span style="color:red">test</span>',
    'Render F element with 2 observables'
  )

  testRender(
    <F.span>{of(0)}</F.span>,
    '<span>0</span>',
    'render single Observable.of(0)'
  )

  describe('show warning for empty observable', () => {
    function testWarning(name: string, render: () => JSX.Element) {
      describe(name, () => {
        testRender(render(), '', 'no render')

        it('console.error() called', () => {
          const consoleError = jest.spyOn(global.console, 'error')
            .mockImplementation(() => void 0)

          ReactDOM.renderToStaticMarkup(render())

          expect(consoleError).toBeCalledWith(
            `[Focal]: The component <span> has received an observable that doesn\'t immediately ` +
            `emit a value in one of its props. Since this observable hasn\'t yet called its ` +
            `subscription handler, the component can not be rendered at the time. Check the ` +
            `props of <span>.`
          )

          consoleError.mockRestore()
        })
      })
    }

    testWarning(
      'single empty',
      () => <F.span>{EMPTY}</F.span>
    )

    testWarning(
      'multiple empty',
      () => <F.span className={NEVER}>{EMPTY}</F.span>
    )

    testWarning(
      'empty and non-empty',
      () => <F.span style={of({ color: 'red' })}>{EMPTY}</F.span>
    )

    testWarning(
      'single never',
      () => <F.span className={NEVER}></F.span>
    )

    testWarning(
      'multiple never',
      () => <F.span className={NEVER} style={NEVER}></F.span>
    )

    testWarning(
      'mixed never and empty',
      () => <F.span className={EMPTY} style={NEVER}></F.span>
    )
  })

  testRender(
    <F.div onClick={() => { /* no-op */ }} style={{ display: 'block', color: of('red') }}>
      <F.span>Hello</F.span>
    </F.div>,
    '<div style="display:block;color:red"><span>Hello</span></div>',
    'div with onClick'
  )

  const LiftedComp = lift(Comp)

  testRender(
    <LiftedComp test={'hi'} />,
    '<div>hi</div>',
    'lift(Comp) with plain value'
  )

  testRender(
    <LiftedComp test={of('hi')} />,
    '<div>hi</div>',
    'lift(Comp) with observable constant'
  )

  testRender(
    <LiftedComp test={of('hi')} />,
    '<div>hi</div>',
    'lifted component with observable constant'
  )

  testRender(
    <F.a {...bind({})}></F.a>,
    '<a></a>',
    'bind, empty'
  )

  testRender(
    <F.a {...bind({ href: Atom.create('test') })} />,
    '<a href="test"></a>',
    'bind, one, constant, one-way'
  )

  testRender(
    <F.a {...bind({ href: Atom.create('test'), data: Atom.create('ok') })} />,
    '<a href="test" data="ok"></a>',
    'bind, many, constant, one-way'
  )

  testRender(
    <F.ul>
      {reactiveList(
        Atom.create([] as number[]),
        id => <li>{id.toString()}</li>
      )}
    </F.ul>,
    '<ul></ul>',
    'reactive list, empty'
  )

  testRender(
    <F.ul>
      {reactiveList(
        Atom.create([1, 2, 3]),
        id => <li key={id}>{id.toString()}</li>
      )}
    </F.ul>,
    '<ul><li>1</li><li>2</li><li>3</li></ul>',
    'reactive list, three items'
  )

  testRender(
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

  testRender(
    <F.a {...classes(Atom.create('test'))}></F.a>,
    '<a class="test"></a>',
    'classes, one, constant'
  )

  const [n, m] = [2, 3]

  testRender(
    <F.a {...classes(n > m && 'a', Atom.create('b'), 'c', m > n && 'd')}></F.a>,
    '<a class="b c d"></a>',
    'classes, mixed types'
  )

  testRender(
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

  testRender(
    <a {...classes(n > m && 'a', 'b', m > n && 'c')}></a>,
    '<a class="b c"></a>',
    'classes, non-lifted component'
  )

  testRender(
    <a {...classes(undefined)}></a>,
    '<a></a>',
    'classes, one undefined constant'
  )

  testRender(
    <a {...classes(undefined && 'a', 'b')}></a>,
    '<a class="b"></a>',
    'classes, undefined constant'
  )

  testRender(
    <F.Fragment>{Atom.create('test')}</F.Fragment>,
    'test',
    'fragment'
  )

  testRender(
    <F.Fragment>{Atom.create(null)}</F.Fragment>,
    '',
    'fragment with null content'
  )

  testRender(
    <F.Fragment><p>left</p>|{Atom.create('right')}</F.Fragment>,
    '<p>left</p>|right',
    'fragment mixed content'
  )

  it('bindElementProps compiles', () => expect((() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (
      <F.div {...bindElementProps({ ref: 'onScroll', scrollTop: Atom.create(0) })}></F.div>
    )

    return true
  })()).toBeTruthy())

  describe('Atom.fromObservable', () => {
    testRender(
      <F.Fragment>
        {Atom.fromObservable(of({ hello: 'world' })).pipe(map(a =>
          <F.Fragment>{a.view('hello')}</F.Fragment>
        ))}
      </F.Fragment>,
      'world',
      'basic'
    )

    testRender(
      <F.Fragment>
        {
          Atom.fromObservable(
            Atom.create({ hello: 'world' }).pipe(throttleTime(1000))
          ).pipe(map(a =>
            <F.Fragment>{a.view('hello')}</F.Fragment>
          ))
        }
      </F.Fragment>,
      'world',
      'atom -> observable -> atom'
    )
  })
})
