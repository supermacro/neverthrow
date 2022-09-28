import { errAsync, ResultAsync } from './'
import { createNeverThrowError, ErrorConfig } from './_internals/error'
import {
  combineResultList,
  combineResultListWithAllErrors,
  InferErrTypes,
  InferOkTypes,
} from './_internals/utils'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  /**
   * Wraps a function with a try catch, creating a new function with the same
   * arguments but returning `Ok` if successful, `Err` if the function throws
   *
   * @param fn function to wrap with ok on success or err on failure
   * @param errorFn when an error is thrown, this will wrap the error result if provided
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function fromThrowable<Fn extends (...args: readonly any[]) => any, E>(
    fn: Fn,
    errorFn?: (e: unknown) => E,
  ): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E> {
    return (...args) => {
      try {
        const result = fn(...args)
        return ok(result)
      } catch (e) {
        return err(errorFn ? errorFn(e) : e)
      }
    }
  }

  export function combine<T extends readonly Result<unknown, unknown>[]>(
    resultList: T,
  ): CombineResults<T> {
    return combineResultList(resultList) as CombineResults<T>
  }

  export function combineWithAllErrors<T extends readonly Result<unknown, unknown>[]>(
    resultList: T,
  ): CombineResultsWithAllErrorsArray<T> {
    return combineResultListWithAllErrors(resultList) as CombineResultsWithAllErrorsArray<T>
  }
}

export type Result<T, E> = Ok<T, E> | Err<T, E>

export const ok = <T, E = never>(value: T): Ok<T, E> => new Ok(value)

export const err = <T = never, E = unknown>(err: E): Err<T, E> => new Err(err)

interface IResult<T, E> {
  /**
   * Used to check if a `Result` is an `OK`
   *
   * @returns `true` if the result is an `OK` variant of Result
   */
  isOk(): this is Ok<T, E>

  /**
   * Used to check if a `Result` is an `Err`
   *
   * @returns `true` if the result is an `Err` variant of Result
   */
  isErr(): this is Err<T, E>

  /**
   * Maps a `Result<T, E>` to `Result<U, E>`
   * by applying a function to a contained `Ok` value, leaving an `Err` value
   * untouched.
   *
   * @param f The function to apply an `OK` value
   * @returns the result of applying `f` or an `Err` untouched
   */
  map<A>(f: (t: T) => A): Result<A, E>

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a
   * contained `Err` value, leaving an `Ok` value untouched.
   *
   * This function can be used to pass through a successful result while
   * handling an error.
   *
   * @param f a function to apply to the error `Err` value
   */
  mapErr<U>(f: (e: E) => U): Result<T, U>

  /**
   * Similar to `map` Except you must return a new `Result`.
   *
   * This is useful for when you need to do a subsequent computation using the
   * inner `T` value, but that computation might fail.
   * Additionally, `andThen` is really useful as a tool to flatten a
   * `Result<Result<A, E2>, E1>` into a `Result<A, E2>` (see example below).
   *
   * @param f The function to apply to the current value
   */
  andThen<R extends Result<unknown, unknown>>(
    f: (t: T) => R,
  ): Result<InferOkTypes<R>, InferErrTypes<R> | E>
  andThen<U, F>(f: (t: T) => Result<U, F>): Result<U, E | F>

  /**
   * Takes an `Err` value and maps it to a `Result<T, SomeNewType>`.
   *
   * This is useful for error recovery.
   *
   *
   * @param f  A function to apply to an `Err` value, leaving `Ok` values
   * untouched.
   */
  orElse<R extends Result<unknown, unknown>>(f: (e: E) => R): Result<T, InferErrTypes<R>>
  orElse<A>(f: (e: E) => Result<T, A>): Result<T, A>

  /**
   * Similar to `map` Except you must return a new `Result`.
   *
   * This is useful for when you need to do a subsequent async computation using
   * the inner `T` value, but that computation might fail. Must return a ResultAsync
   *
   * @param f The function that returns a `ResultAsync` to apply to the current
   * value
   */
  asyncAndThen<U, F>(f: (t: T) => ResultAsync<U, F>): ResultAsync<U, E | F>

  /**
   * Maps a `Result<T, E>` to `ResultAsync<U, E>`
   * by applying an async function to a contained `Ok` value, leaving an `Err`
   * value untouched.
   *
   * @param f An async function to apply an `OK` value
   */
  asyncMap<U>(f: (t: T) => Promise<U>): ResultAsync<U, E>

  /**
   * Unwrap the `Ok` value, or return the default if there is an `Err`
   *
   * @param v the default value to return if there is an `Err`
   */
  unwrapOr<A>(v: A): T | A

  /**
   *
   * Given 2 functions (one for the `Ok` variant and one for the `Err` variant)
   * execute the function that matches the `Result` variant.
   *
   * Match callbacks do not necessitate to return a `Result`, however you can
   * return a `Result` if you want to.
   *
   * `match` is like chaining `map` and `mapErr`, with the distinction that
   * with `match` both functions must have the same return type.
   *
   * @param ok
   * @param err
   */
  match<A>(ok: (t: T) => A, err: (e: E) => A): A

  /**
   * **This method is unsafe, and should only be used in a test environments**
   *
   * Takes a `Result<T, E>` and returns a `T` when the result is an `Ok`, otherwise it throws a custom object.
   *
   * @param config
   */
  _unsafeUnwrap(config?: ErrorConfig): T

  /**
   * **This method is unsafe, and should only be used in a test environments**
   *
   * takes a `Result<T, E>` and returns a `E` when the result is an `Err`,
   * otherwise it throws a custom object.
   *
   * @param config
   */
  _unsafeUnwrapErr(config?: ErrorConfig): E
}

export class Ok<T, E> implements IResult<T, E> {
  constructor(readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true
  }

  isErr(): this is Err<T, E> {
    return !this.isOk()
  }

  map<A>(f: (t: T) => A): Result<A, E> {
    return ok(f(this.value))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mapErr<U>(_f: (e: E) => U): Result<T, U> {
    return ok(this.value)
  }

  andThen<R extends Result<unknown, unknown>>(
    f: (t: T) => R,
  ): Result<InferOkTypes<R>, InferErrTypes<R> | E>
  andThen<U, F>(f: (t: T) => Result<U, F>): Result<U, E | F>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  andThen(f: any): any {
    return f(this.value)
  }

  orElse<R extends Result<unknown, unknown>>(_f: (e: E) => R): Result<T, InferErrTypes<R>>
  orElse<A>(_f: (e: E) => Result<T, A>): Result<T, A>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  orElse(_f: any): any {
    return ok(this.value)
  }

  asyncAndThen<U, F>(f: (t: T) => ResultAsync<U, F>): ResultAsync<U, E | F> {
    return f(this.value)
  }

  asyncMap<U>(f: (t: T) => Promise<U>): ResultAsync<U, E> {
    return ResultAsync.fromSafePromise(f(this.value))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unwrapOr<A>(_v: A): T | A {
    return this.value
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  match<A>(ok: (t: T) => A, _err: (e: E) => A): A {
    return ok(this.value)
  }

  _unsafeUnwrap(_?: ErrorConfig): T {
    return this.value
  }

  _unsafeUnwrapErr(config?: ErrorConfig): E {
    throw createNeverThrowError('Called `_unsafeUnwrapErr` on an Ok', this, config)
  }
}

export class Err<T, E> implements IResult<T, E> {
  constructor(readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return false
  }

  isErr(): this is Err<T, E> {
    return !this.isOk()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<A>(_f: (t: T) => A): Result<A, E> {
    return err(this.error)
  }

  mapErr<U>(f: (e: E) => U): Result<T, U> {
    return err(f(this.error))
  }

  andThen<R extends Result<unknown, unknown>>(
    _f: (t: T) => R,
  ): Result<InferOkTypes<R>, InferErrTypes<R> | E>
  andThen<U, F>(_f: (t: T) => Result<U, F>): Result<U, E | F>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  andThen(_f: any): any {
    return err(this.error)
  }

  orElse<R extends Result<unknown, unknown>>(f: (e: E) => R): Result<T, InferErrTypes<R>>
  orElse<A>(f: (e: E) => Result<T, A>): Result<T, A>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  orElse(f: any): any {
    return f(this.error)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  asyncAndThen<U, F>(_f: (t: T) => ResultAsync<U, F>): ResultAsync<U, E | F> {
    return errAsync<U, E>(this.error)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  asyncMap<U>(_f: (t: T) => Promise<U>): ResultAsync<U, E> {
    return errAsync<U, E>(this.error)
  }

  unwrapOr<A>(v: A): T | A {
    return v
  }

  match<A>(_ok: (t: T) => A, err: (e: E) => A): A {
    return err(this.error)
  }

  _unsafeUnwrap(config?: ErrorConfig): T {
    throw createNeverThrowError('Called `_unsafeUnwrap` on an Err', this, config)
  }

  _unsafeUnwrapErr(_?: ErrorConfig): E {
    return this.error
  }
}

export const fromThrowable = Result.fromThrowable

//#region Combine - Types

// Given a union, this extracts the intersection of the unions by casting it
// to a parameter of a function and then inferring from it.
type IntersectOf<U extends any>
  = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

// Given a union, this extracts the last possible value.
type Last<U extends any>
  = IntersectOf<U extends unknown ? (x: U) => void : never> extends (x: infer P) => void ? P : never

/// Given a union and a member, this excludes the member.
type ExcludeUnionItem<U extends any, M extends any> = U extends M ? never : U

// Given two types, this checks whether the A1 is extending the A2, including
// the `never` type in calculation. If A1 is `never`, then this will be `0`.
type IsExtending<A1 extends any, A2 extends any>
  = [ A1 ] extends [ never ] ? 0 : A1 extends A2 ? 1 : 0

// Given an array and a type, this extends the array by prepending the `A`.
type Prepend<L extends ReadonlyArray<any>, A extends any> = [
  A,
  ...L
]

// Given a union, this gives the array of the union members.
type MemberListOf<
  Union,
  MemberList extends ReadonlyArray<any> = [],
  LastU = Last<Union>
  > = {
    0: MemberListOf<ExcludeUnionItem<Union, LastU>, Prepend<MemberList, LastU>>
    1: MemberList
  }[ IsExtending<[ Union ], [ never ]> ]

// This is a helper type to prevent infinite recursion in typing rules.
//
// Use this with your `depth` variable in your types.
type Prev = [
  never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]
]

// Combines the both sides of the array of the results into a tuple of the
// union of the ok types and the union of the err types.
//
// T     - The array of the results
// Oks   - The initial `Ok` type values 
// Errs  - The initial `Err` type values
// Depth - The maximum depth.
type Combine<
  T,
  Oks extends any[] = [],
  Errs extends any[] = [],
  Depth extends number = 5
  >
  =
  // If we have reached to the maximum depth, return unknown for both sides
  [ Depth ] extends [ never ] ? Result<unknown, unknown>

  // Otherwise test whether T is the list of possible values
  : T extends [ infer H, ...infer Rest ] ? (
    // And test whether the head of the list is a result
    H extends Result<infer L, infer R> ? (
      // Continue combining...
      Combine<
        // the rest of the elements
        Rest,

        // excluding the `unknown` type variables for `Ok` results
        [ unknown ] extends [ L ] ? Oks : [ L, ...Oks ],

        // excluding the `unknown` type variables for `Err` results
        [ unknown ] extends [ R ] ? Errs : [ R, ...Errs ],

        // and one less of the current depth
        Prev[ Depth ]
      >
    ) : never // Impossible
  ) : [ Oks[ number ], Errs[ number ] ] // the results combined

// Traverses an array of results and returns a single result containing
// the oks and errs union-ed/combined.
type Traverse<
  T,
  Oks extends any[] = [],
  Errs extends any[] = [],
  Depth extends number = 5
  >
  = Combine<T, Oks, Errs, Depth> extends [ infer Oks, infer Errs ] ? (
    Result<Oks, Errs>
  ) : never

// Traverses an array of results and returns a single result containing
// the oks combined and the array of errors combined.
type TraverseWithAllErrors<
  T,
  Oks extends any[] = [],
  Errs extends any[] = [],
  Depth extends number = 5
  >
  = Combine<T, Oks, Errs, Depth> extends [ infer Oks, infer Errs ] ? (
    Result<Oks, Errs[]>
  ) : never

// Combines the array of results into one result.
export type CombineResults<T extends readonly Result<unknown, unknown>[]>
  = T extends ReadonlyArray<infer U> ? Traverse<MemberListOf<U>> : never

// Combines the array of results into one result with all errors.
export type CombineResultsWithAllErrorsArray<T extends readonly Result<unknown, unknown>[]>
  = T extends ReadonlyArray<infer U> ? TraverseWithAllErrors<MemberListOf<U>> : never

//#endregion
