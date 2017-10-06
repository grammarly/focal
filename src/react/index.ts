export * from './react'

// @NOTE need the following import to prevent TS error
// "variable is using name from external module but can not be named"
// tslint:disable-next-line no-unused-variable
import { LiftedIntrinsics } from './intrinsic'
import { createLiftedIntrinsics } from './intrinsic'

export const F = createLiftedIntrinsics()
