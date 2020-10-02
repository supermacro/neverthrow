import { Result, ok, err } from './result'
import { ResultAsync } from './result-async'

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

export function combine<T, E>(resultList: Result<T, E>[]): Result<T[], E>

export function combine<T, E>(asyncResultList: ResultAsync<T, E>[]): ResultAsync<T[], E>

// eslint-disable-next-line
export function combine(list: any): any {
  if (list[0] instanceof ResultAsync) {
    return combineResultAsyncList(list)
  } else {
    return combineResultList(list)
  }
}
