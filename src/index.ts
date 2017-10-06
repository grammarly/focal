export { Lens, Prism, Optic } from './lens/index'
export { Atom, ReadOnlyAtom } from './atom/index'
export { Option } from './utils'

// @NOTE need the following import to prevent TS error
// "variable is using name from external module but can not be named"
// tslint:disable-next-line no-unused-variable
import { LiftedIntrinsics } from './react/intrinsic'
import { createLiftedIntrinsics } from './react/intrinsic'

export const F = createLiftedIntrinsics()

export {
  bind,
  lift,
  reactiveList,
  classes,
  bindElementProps
} from './react/index'
