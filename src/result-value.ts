import { Result } from 'result'
import { ResultAsync } from 'result-async'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResultValue<T extends Result<any, any> | ResultAsync<any, any>> = T extends Result<
  infer U,
  infer _
>
  ? U
  : T extends ResultAsync<infer U, infer _>
  ? U
  : never
