import { Result } from 'result'
import { ResultAsync } from 'result-async'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResultError<T extends Result<any, any> | ResultAsync<any, any>> = T extends Result<
  infer _,
  infer E
>
  ? E
  : T extends ResultAsync<infer _, infer E>
  ? E
  : never
