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

const appendValueToEndOfList = <T>(value: T) => (list: T[]): T[] => [...list, value]

/**
 * Short circuits on the FIRST Err value that we find
 */
export const combineResultList = <T, E>(resultList: Result<T, E>[]): Result<T[], E> =>
  resultList.reduce(
    (acc, result) =>
      acc.isOk()
        ? result.isErr()
          ? err(result.error)
          : acc.map(appendValueToEndOfList(result.value))
        : acc,
    ok([]) as Result<T[], E>,
  )

/* This is the typesafe version of Promise.all
 *
 * Takes a list of ResultAsync<T, E> and success if all inner results are Ok values
 * or fails if one (or more) of the inner results are Err values
 */
export const combineResultAsyncList = <T, E>(
  asyncResultList: ResultAsync<T, E>[],
): ResultAsync<T[], E> =>
  ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(
    combineResultList,
  ) as ResultAsync<T[], E>

/**
 * Give a list of all the errors we find
 */
export const combineResultListWithAllErrors = <T, E>(
  resultList: Result<T, E>[],
): Result<T[], E[]> =>
  resultList.reduce(
    (acc, result) =>
      result.isErr()
        ? acc.isErr()
          ? err([...acc.error, result.error])
          : err([result.error])
        : acc.isErr()
        ? acc
        : ok([...acc.value, result.value]),
    ok([]) as Result<T[], E[]>,
  )

export const combineResultAsyncListWithAllErrors = <T, E>(
  asyncResultList: ResultAsync<T, E>[],
): ResultAsync<T[], E[]> =>
  ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(
    combineResultListWithAllErrors,
  ) as ResultAsync<T[], E[]>
