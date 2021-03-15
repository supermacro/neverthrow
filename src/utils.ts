import { Result, ok, err } from './result'
import { ResultAsync } from './result-async'

// Given a list of Results, this extracts all the different `T` types from that list
type ExtractOkTypes<T extends readonly Result<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends Result<infer U, unknown> ? U : never
}

// Given a list of ResultAsyncs, this extracts all the different `T` types from that list
type ExtractOkAsyncTypes<T extends readonly ResultAsync<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends ResultAsync<infer U, unknown> ? U : never
}

// Given a list of Results, this extracts all the different `E` types from that list
type ExtractErrTypes<T extends readonly Result<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends Result<unknown, infer E> ? E : never
}

// Given a list of ResultAsyncs, this extracts all the different `E` types from that list
type ExtractErrAsyncTypes<T extends readonly ResultAsync<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends ResultAsync<unknown, infer E> ? E : never
}

const appendValueToEndOfList = <T>(value: T) => (list: T[]): T[] => {
  // need to wrap `value` inside of an array in order to prevent
  // Array.prototype.concat from destructuring the contents of `value`
  // into `list`.
  //
  // Otherwise you will receive [ 'hi', 1, 2, 3 ]
  // when you actually expected a tuple containing [ 'hi', [ 1, 2, 3 ] ]
  if (Array.isArray(value)) {
    return list.concat([value])
  }

  return list.concat(value)
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
          : acc.map(appendValueToEndOfList(result.value))
        : acc,
    ok([]) as Result<T[], E>,
  )

/* This is the typesafe version of Promise.all
 *
 * Takes a list of ResultAsync<T, E> and success if all inner results are Ok values
 * or fails if one (or more) of the inner results are Err values
 */
const combineResultAsyncList = <T, E>(asyncResultList: ResultAsync<T, E>[]): ResultAsync<T[], E> =>
  ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(
    combineResultList,
  ) as ResultAsync<T[], E>

export function combine<T extends readonly Result<unknown, unknown>[]>(
  resultList: T,
): Result<ExtractOkTypes<T>, ExtractErrTypes<T>[number]>

export function combine<T extends readonly ResultAsync<unknown, unknown>[]>(
  asyncResultList: T,
): ResultAsync<ExtractOkAsyncTypes<T>, ExtractErrAsyncTypes<T>[number]>

// eslint-disable-next-line
export function combine(list: any): any {
  if (list[0] instanceof ResultAsync) {
    return combineResultAsyncList(list)
  } else {
    return combineResultList(list)
  }
}

/**
 * Give a list of all the errors we find
 */
const combineResultListWithAllErrors = <T, E>(resultList: Result<T, E>[]): Result<T[], E[]> =>
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

export function combineWithAllErrors<T extends readonly Result<unknown, unknown>[]>(
  resultList: T,
): Result<ExtractOkTypes<T>, ExtractErrTypes<T>[number][]>

// eslint-disable-next-line
export function combineWithAllErrors(list: any): any {
  return combineResultListWithAllErrors(list)
}
