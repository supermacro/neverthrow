import { Result, ok, err } from '../result'
import { ResultAsync } from '../result-async'

// Given a list of Results, this extracts all the different `T` types from that list
export type ExtractOkTypes<T extends readonly Result<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends Result<infer U, unknown> ? U : never
}

// Given a list of ResultAsyncs, this extracts all the different `T` types from that list
export type ExtractOkAsyncTypes<T extends readonly ResultAsync<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends ResultAsync<infer U, unknown> ? U : never
}

// Given a list of Results, this extracts all the different `E` types from that list
export type ExtractErrTypes<T extends readonly Result<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends Result<unknown, infer E> ? E : never
}

// Given a list of ResultAsyncs, this extracts all the different `E` types from that list
export type ExtractErrAsyncTypes<T extends readonly ResultAsync<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends ResultAsync<unknown, infer E> ? E : never
}

export type InferOkTypes<R> = R extends Result<infer T, unknown> ? T : never
export type InferErrTypes<R> = R extends Result<unknown, infer E> ? E : never

export type InferAsyncOkTypes<R> = R extends ResultAsync<infer T, unknown> ? T : never
export type InferAsyncErrTypes<R> = R extends ResultAsync<unknown, infer E> ? E : never

/**
 * Short circuits on the FIRST Err value that we find
 */
export const combineResultList = <T, E>(
  resultList: readonly Result<T, E>[],
): Result<readonly T[], E> => {
  let acc = ok([]) as Result<T[], E>

  for (const result of resultList) {
    if (result.isErr()) {
      acc = err(result.error)
      break
    } else {
      acc.map((list) => list.push(result.value))
    }
  }
  return acc
}

/* This is the typesafe version of Promise.all
 *
 * Takes a list of ResultAsync<T, E> and success if all inner results are Ok values
 * or fails if one (or more) of the inner results are Err values
 */
export const combineResultAsyncList = <T, E>(
  asyncResultList: readonly ResultAsync<T, E>[],
): ResultAsync<readonly T[], E> =>
  ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(
    combineResultList,
  ) as ResultAsync<T[], E>

/**
 * Give a list of all the errors we find
 */
export const combineResultListWithAllErrors = <T, E>(
  resultList: readonly Result<T, E>[],
): Result<readonly T[], E[]> => {
  let acc = ok([]) as Result<T[], E[]>

  for (const result of resultList) {
    if (result.isErr() && acc.isErr()) {
      acc.error.push(result.error)
    } else if (result.isErr() && acc.isOk()) {
      acc = err([result.error])
    } else if (result.isOk() && acc.isOk()) {
      acc.value.push(result.value)
    }
    // do nothing when result.isOk() && acc.isErr()
  }
  return acc
}

export const combineResultAsyncListWithAllErrors = <T, E>(
  asyncResultList: readonly ResultAsync<T, E>[],
): ResultAsync<readonly T[], E[]> =>
  ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(
    combineResultListWithAllErrors,
  ) as ResultAsync<T[], E[]>
