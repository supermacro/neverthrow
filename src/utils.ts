import { Result, ok, err } from './result'
import { ResultAsync } from './result-async'

// Given a list of Results, this extracts all the different `T` types from that list
type ExtractOkTypes<T extends Result<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends Result<infer U, unknown> ? U : never
}

// Given a list of ResultAsyncs, this extracts all the different `T` types from that list
type ExtractOkAsyncTypes<T extends ResultAsync<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends ResultAsync<infer U, unknown> ? U : never
}

// Given a list of Results, this extracts all the different `E` types from that list
type ExtractErrTypes<T extends Result<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends Result<unknown, infer E> ? E : never
}

// Given a list of ResultAsyncs, this extracts all the different `E` types from that list
type ExtractErrAsyncTypes<T extends ResultAsync<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends ResultAsync<unknown, infer E> ? E : never
}

/**
 * Short circuits on the FIRST Err value that we find
 */
const combineResultList = <T, E>(resultList: Result<T, E>[]): Result<T[], E> =>
  resultList.reduce(
    (acc, result) =>
      acc.isOk()
        ? result.isErr()
          ? err(result.error)
          : acc.map((values) => values.concat(result.value))
        : acc,
    ok([]) as Result<T[], E>,
  )

/* This is the typesafe version of Promise.all
 *
 * Takes a list of ResultAsync<T, E> and success if all inner results are Ok values
 * or fails if one (or more) of the inner results are Err values
 */
const combineResultAsyncList = <T, E>(asyncResultList: ResultAsync<T, E>[]): ResultAsync<T[], E> =>
  ResultAsync.fromPromise(Promise.all(asyncResultList)).andThen(combineResultList) as ResultAsync<
    T[],
    E
  >

export function combine<T extends Result<unknown, unknown>[]>(
  resultList: [...T],
): Result<ExtractOkTypes<T>, ExtractErrTypes<T>[number]>

export function combine<T extends ResultAsync<unknown, unknown>[]>(
  asyncResultList: [...T],
): Result<ExtractOkAsyncTypes<T>, ExtractErrAsyncTypes<T>[number]>

// eslint-disable-next-line
export function combine(list: any): any {
  if (list[0] instanceof ResultAsync) {
    return combineResultAsyncList(list)
  } else {
    return combineResultList(list)
  }
}
