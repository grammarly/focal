import { fromEvent } from 'rxjs'
import { startWith, distinctUntilChanged, map } from 'rxjs/operators'
import {
  F, Atom, ReadOnlyAtom, bindElementProps, reactiveList
} from '@grammarly/focal'
import * as React from 'react'

const Window = {
  innerWidth:
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth),
      distinctUntilChanged(),
      startWith(0))
}

const defaultState = {
  tableHeight: 250,
  rowHeight: 30,
  rowCount: 10000,
  columns: [ 'ID', 'ID * 10', 'Random Number' ]
}

function getRowContent(id: number) {
  return [ `${id}`, `${id * 10}`, `${Math.floor(Math.random() * 100)}` ]
}

function cellWidthStyle(columns: string[]) {
  return Window.innerWidth.pipe(map(innerWidth =>
    ({ width: innerWidth / columns.length + 'px' })))
}

function getVisibleRows(
  tableHeight: number, rowHeight: number, rowCount: number, scrollTop: number
) {
  return {
    begin: Math.floor(scrollTop / rowHeight),
    end: Math.min(rowCount, Math.ceil((scrollTop + tableHeight) / rowHeight))
  }
}

const THead = (props: { columns: ReadOnlyAtom<string[]> }) =>
  <thead>
    <F.tr>
      {props.columns.view(cols =>
        cols.map((col, i) =>
          <F.th key={i} style={cellWidthStyle(cols)}>{col}</F.th>))}
    </F.tr>
  </thead>

const TBody = (props: {
  state: Atom<typeof defaultState>
  visibleRows: ReadOnlyAtom<{ begin: number; end: number }>
}) =>
  <F.tbody>
    {reactiveList(
      props.visibleRows.view(({ begin, end }) =>
        Array.from(Array(end - begin), (_, i) => i + begin)),
      i =>
        <F.tr
          key={i}
          style={{
            position: 'absolute',
            top: props.state.view(({ rowHeight }) => i * rowHeight + 'px'),
            borderBottom: '1px solid grey'
          }}
        >
          {props.state.view(({ columns }) =>
            getRowContent(i).map((column, i) =>
              <F.td style={cellWidthStyle(columns)} key={i}>{column}</F.td>))}
        </F.tr>
    )}
  </F.tbody>

const App = ({
  state,
  scrollTop = Atom.create(0)
}: {
  state: Atom<typeof defaultState>
  scrollTop: Atom<number>
}) =>
  <div>
    <table
      style={{
        width: '100%',
        overflowX: 'hidden',
        borderBottom: '1px solid black'
      }}
    >
      <THead columns={state.view('columns')}/>
    </table>
    <F.div
      {...bindElementProps({ forwardRef: 'onScroll', scrollTop })}
      style={{
        position: 'relative',
        overflowX: 'hidden',
        borderBottom: '1px solid black',
        height: state.view(x => x.tableHeight + 'px')
      }}
    >
      <F.table
        style={{
          height: state.view(x => x.rowCount * x.rowHeight + 'px')
        }}
      >
        <TBody
          {...{
            state,
            visibleRows: Atom.combine(
              state, scrollTop,
              (m, s) => getVisibleRows(m.tableHeight, m.rowHeight, m.rowCount, s)
            )
          }}
        />
      </F.table>
    </F.div>
  </div>

export default {
  Component: App,
  defaultState: defaultState
}
