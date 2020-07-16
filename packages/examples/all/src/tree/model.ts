export interface NodeState {
  value: number
  children: NodeState[]
}

export interface AppState {
  tree: NodeState
}

export const defaultNodeState = {
  value: 0,
  children: []
}

export const defaultAppState: AppState = {
  tree: defaultNodeState
}
