import type {
  Combine,
  Dedup,
  EmptyArrayToNever,
  IsLiteralArray,
  MemberListOf,
  MembersToUnion,
} from './result'

import { Err, Ok, Result } from './'
import {
  combineResultAsyncList,
  combineResultAsyncListWithAllErrors,
  ExtractErrAsyncTypes,
  ExtractOkAsyncTypes,
  InferAsyncErrTypes,
  InferAsyncOkTypes,
  InferErrTypes,
  InferOkTypes,
} from './_internals/utils'

export class ResultAsync<T, E> implements PromiseLike<Result<T, E>> {
  private _promise: Promise<Result<T, E>>

  constructor(res: Promise<Result<T, E>>) {
    this._promise = res
  }

  static fromSafePromise<T, E = never>(promise: PromiseLike<T>): ResultAsync<T, E>
  static fromSafePromise<T, E = never>(promise: Promise<T>): ResultAsync<T, E> {
    const newPromise = promise.then((value: T) => new Ok<T, E>(value))

    return new ResultAsync(newPromise)
  }

  static fromPromise<T, E>(promise: PromiseLike<T>, errorFn: (e: unknown) => E): ResultAsync<T, E>
  static fromPromise<T, E>(promise: Promise<T>, errorFn: (e: unknown) => E): ResultAsync<T, E> {
    const newPromise = promise
      .then((value: T) => new Ok<T, E>(value))
      .catch((e) => new Err<T, E>(errorFn(e)))

    return new ResultAsync(newPromise)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromThrowable<A extends readonly any[], R, E>(
    fn: (...args: A) => Promise<R>,
    errorFn?: (err: unknown) => E,
  ): (...args: A) => ResultAsync<R, E> {
    return (...args) => {
      return new ResultAsync(
        (async () => {
          try {
            return new Ok(await fn(...args))
          } catch (error) {
            return new Err(errorFn ? errorFn(error) : error)
          }
        })(),
      )
    }
  }

  static combine<
    T extends readonly [ResultAsync<unknown, unknown>, ...ResultAsync<unknown, unknown>[]]
  >(asyncResultList: T): CombineResultAsyncs<T>
  static combine<T extends readonly ResultAsync<unknown, unknown>[]>(
    asyncResultList: T,
  ): CombineResultAsyncs<T>
  static combine<T extends readonly ResultAsync<unknown, unknown>[]>(
    asyncResultList: T,
  ): CombineResultAsyncs<T> {
    return (combineResultAsyncList(asyncResultList) as unknown) as CombineResultAsyncs<T>
  }

  static combineWithAllErrors<
    T extends readonly [ResultAsync<unknown, unknown>, ...ResultAsync<unknown, unknown>[]]
  >(asyncResultList: T): CombineResultsWithAllErrorsArrayAsync<T>
  static combineWithAllErrors<T extends readonly ResultAsync<unknown, unknown>[]>(
    asyncResultList: T,
  ): CombineResultsWithAllErrorsArrayAsync<T>
  static combineWithAllErrors<T extends readonly ResultAsync<unknown, unknown>[]>(
    asyncResultList: T,
  ): CombineResultsWithAllErrorsArrayAsync<T> {
    return combineResultAsyncListWithAllErrors(
      asyncResultList,
    ) as CombineResultsWithAllErrorsArrayAsync<T>
  }

  map<A>(f: (t: T) => A | Promise<A>): ResultAsync<A, E> {
    return new ResultAsync(
      this._promise.then(async (res: Result<T, E>) => {
        if (res.isErr()) {
          return new Err<A, E>(res.error)
        }

        return new Ok<A, E>(await f(res.value))
      }),
    )
  }

  andThrough<F>(f: (t: T) => Result<unknown, F> | ResultAsync<unknown, F>): ResultAsync<T, E | F> {
    return new ResultAsync(
      this._promise.then(async (res: Result<T, E>) => {
        if (res.isErr()) {
          return new Err<T, E>(res.error)
        }

        const newRes = await f(res.value)
        if (newRes.isErr()) {
          return new Err<T, F>(newRes.error)
        }
        return new Ok<T, F>(res.value)
      }),
    )
  }

  andTee(f: (t: T) => unknown): ResultAsync<T, E> {
    return new ResultAsync(
      this._promise.then(async (res: Result<T, E>) => {
        if (res.isErr()) {
          return new Err<T, E>(res.error)
        }
        try {
          await f(res.value)
        } catch (e) {
          // Tee does not care about the error
        }
        return new Ok<T, E>(res.value)
      }),
    )
  }

  orTee(f: (t: E) => unknown): ResultAsync<T, E> {
    return new ResultAsync(
      this._promise.then(async (res: Result<T, E>) => {
        if (res.isOk()) {
          return new Ok<T, E>(res.value)
        }
        try {
          await f(res.error)
        } catch (e) {
          // Tee does not care about the error
        }
        return new Err<T, E>(res.error)
      }),
    )
  }

  mapErr<U>(f: (e: E) => U | Promise<U>): ResultAsync<T, U> {
    return new ResultAsync(
      this._promise.then(async (res: Result<T, E>) => {
        if (res.isOk()) {
          return new Ok<T, U>(res.value)
        }

        return new Err<T, U>(await f(res.error))
      }),
    )
  }

  andThen<R extends Result<unknown, unknown>>(
    f: (t: T) => R,
  ): ResultAsync<InferOkTypes<R>, InferErrTypes<R> | E>
  andThen<R extends ResultAsync<unknown, unknown>>(
    f: (t: T) => R,
  ): ResultAsync<InferAsyncOkTypes<R>, InferAsyncErrTypes<R> | E>
  andThen<U, F>(f: (t: T) => Result<U, F> | ResultAsync<U, F>): ResultAsync<U, E | F>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  andThen(f: any): any {
    return new ResultAsync(
      this._promise.then((res) => {
        if (res.isErr()) {
          return new Err<never, E>(res.error)
        }

        const newValue = f(res.value)
        return newValue instanceof ResultAsync ? newValue._promise : newValue
      }),
    )
  }

  orElse<R extends Result<unknown, unknown>>(
    f: (e: E) => R,
  ): ResultAsync<InferOkTypes<R> | T, InferErrTypes<R>>
  orElse<R extends ResultAsync<unknown, unknown>>(
    f: (e: E) => R,
  ): ResultAsync<InferAsyncOkTypes<R> | T, InferAsyncErrTypes<R>>
  orElse<U, A>(f: (e: E) => Result<U, A> | ResultAsync<U, A>): ResultAsync<U | T, A>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  orElse(f: any): any {
    return new ResultAsync(
      this._promise.then(async (res: Result<T, E>) => {
        if (res.isErr()) {
          return f(res.error)
        }

        return new Ok<T, unknown>(res.value)
      }),
    )
  }

  match<A, B = A>(ok: (t: T) => A, _err: (e: E) => B): Promise<A | B> {
    return this._promise.then((res) => res.match(ok, _err))
  }

  unwrapOr<A>(t: A): Promise<T | A> {
    return this._promise.then((res) => res.unwrapOr(t))
  }

  /**
   * @deprecated will be removed in 9.0.0.
   *
   * You can use `safeTry` without this method.
   * @example
   * ```typescript
   * safeTry(async function* () {
   *   const okValue = yield* yourResult
   * })
   * ```
   * Emulates Rust's `?` operator in `safeTry`'s body. See also `safeTry`.
   */
  async *safeUnwrap(): AsyncGenerator<Err<never, E>, T> {
    return yield* await this._promise.then((res) => res.safeUnwrap())
  }

  // Makes ResultAsync implement PromiseLike<Result>
  then<A, B>(
    successCallback?: (res: Result<T, E>) => A | PromiseLike<A>,
    failureCallback?: (reason: unknown) => B | PromiseLike<B>,
  ): PromiseLike<A | B> {
    return this._promise.then(successCallback, failureCallback)
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<Err<never, E>, T> {
    const result = await this._promise

    if (result.isErr()) {
      // @ts-expect-error -- This is structurally equivalent and safe
      yield errAsync(result.error)
    }

    // @ts-expect-error -- This is structurally equivalent and safe
    return result.value
  }
}

export function okAsync<T, E = never>(value: T): ResultAsync<T, E>
export function okAsync<T extends void = void, E = never>(value: void): ResultAsync<void, E>
export function okAsync<T, E = never>(value: T): ResultAsync<T, E> {
  return new ResultAsync(Promise.resolve(new Ok<T, E>(value)))
}

export function errAsync<T = never, E = unknown>(err: E): ResultAsync<T, E>
export function errAsync<T = never, E extends void = void>(err: void): ResultAsync<T, void>
export function errAsync<T = never, E = unknown>(err: E): ResultAsync<T, E> {
  return new ResultAsync(Promise.resolve(new Err<T, E>(err)))
}

export const fromPromise = ResultAsync.fromPromise
export const fromSafePromise = ResultAsync.fromSafePromise

export const fromAsyncThrowable = ResultAsync.fromThrowable

// Combines the array of async results into one result.
export type CombineResultAsyncs<
  T extends readonly ResultAsync<unknown, unknown>[]
> = IsLiteralArray<T> extends 1
  ? TraverseAsync<UnwrapAsync<T>>
  : ResultAsync<ExtractOkAsyncTypes<T>, ExtractErrAsyncTypes<T>[number]>

// Combines the array of async results into one result with all errors.
export type CombineResultsWithAllErrorsArrayAsync<
  T extends readonly ResultAsync<unknown, unknown>[]
> = IsLiteralArray<T> extends 1
  ? TraverseWithAllErrorsAsync<UnwrapAsync<T>>
  : ResultAsync<ExtractOkAsyncTypes<T>, ExtractErrAsyncTypes<T>[number][]>

// Unwraps the inner `Result` from a `ResultAsync` for all elements.
type UnwrapAsync<T> = IsLiteralArray<T> extends 1
  ? Writable<T> extends [infer H, ...infer Rest]
    ? H extends PromiseLike<infer HI>
      ? HI extends Result<unknown, unknown>
        ? [Dedup<HI>, ...UnwrapAsync<Rest>]
        : never
      : never
    : []
  : // If we got something too general such as ResultAsync<X, Y>[] then we
  // simply need to map it to ResultAsync<X[], Y[]>. Yet `ResultAsync`
  // itself is a union therefore it would be enough to cast it to Ok.
  T extends Array<infer A>
  ? A extends PromiseLike<infer HI>
    ? HI extends Result<infer L, infer R>
      ? Ok<L, R>[]
      : never
    : never
  : never

// Traverse through the tuples of the async results and create one
// `ResultAsync` where the collected tuples are merged.
type TraverseAsync<T, Depth extends number = 5> = IsLiteralArray<T> extends 1
  ? Combine<T, Depth> extends [infer Oks, infer Errs]
    ? ResultAsync<EmptyArrayToNever<Oks>, MembersToUnion<Errs>>
    : never
  : // The following check is important if we somehow reach to the point of
  // checking something similar to ResultAsync<X, Y>[]. In this case we don't
  // know the length of the elements, therefore we need to traverse the X and Y
  // in a way that the result should contain X[] and Y[].
  T extends Array<infer I>
  ? // The MemberListOf<I> here is to include all possible types. Therefore
    // if we face (ResultAsync<X, Y> | ResultAsync<A, B>)[] this type should
    // handle the case.
    Combine<MemberListOf<I>, Depth> extends [infer Oks, infer Errs]
    ? // The following `extends unknown[]` checks are just to satisfy the TS.
      // we already expect them to be an array.
      Oks extends unknown[]
      ? Errs extends unknown[]
        ? ResultAsync<EmptyArrayToNever<Oks[number][]>, MembersToUnion<Errs[number][]>>
        : ResultAsync<EmptyArrayToNever<Oks[number][]>, Errs>
      : // The rest of the conditions are to satisfy the TS and support
      // the edge cases which are not really expected to happen.
      Errs extends unknown[]
      ? ResultAsync<Oks, MembersToUnion<Errs[number][]>>
      : ResultAsync<Oks, Errs>
    : never
  : never

// This type is similar to the `TraverseAsync` while the errors are also
// collected in a list. For the checks/conditions made here, see that type
// for the documentation.
type TraverseWithAllErrorsAsync<T, Depth extends number = 5> = TraverseAsync<
  T,
  Depth
> extends ResultAsync<infer Oks, infer Errs>
  ? ResultAsync<Oks, Errs[]>
  : never

// Converts a reaodnly array into a writable array
type Writable<T> = T extends ReadonlyArray<unknown> ? [...T] : T
