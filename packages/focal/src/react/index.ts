export * from './react'

// @NOTE need the following import to prevent TS error
// "variable is using name from external module but can not be named"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { LiftedIntrinsics } from './intrinsic'
import { createLiftedIntrinsics } from './intrinsic'

export const F = createLiftedIntrinsics()
