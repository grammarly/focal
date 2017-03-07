import { Atom, ReadOnlyAtom, Lens } from '@grammarly/focal'

export interface HistoryState<T> {
  readonly position: number
  readonly history: T[]
}

export namespace HistoryState {
  export function createDefault<T>(initialValue: T) {
    return {
      position: 0,
      history: [initialValue]
    } as HistoryState<T>
  }
}

export interface History<T> {
  readonly state: Atom<T>
  readonly canUndo: ReadOnlyAtom<boolean>
  readonly canRedo: ReadOnlyAtom<boolean>

  undo(): void
  redo(): void
}

export namespace History {
  export function create<T>(historyState: Atom<HistoryState<T>>): History<T> {
    const position = historyState.lens(x => x.position)
    const redoCount = historyState.view(s => s.history.length - s.position - 1)

    return {
      state: historyState.lens(
        // a lens that will return value at current position on read
        // and append to history on write, updating current index
        Lens.create(
          (s: HistoryState<T>): T => s.history[s.position],
          (v, s) => {
            const newPosition = s.position + 1

            return {
              position: newPosition,
              history: s.history
                .slice(0, newPosition)
                .concat([v])
            }
          }
        )
      ),
      canUndo: position.view(x => x === 0),
      canRedo: redoCount.view(x => x === 0),

      undo() {
        if (position.get() > 0)
          position.modify(x => x - 1)
      },
      redo() {
        if (redoCount.get() > 0)
          position.modify(x => x + 1)
      }
    }
  }
}
