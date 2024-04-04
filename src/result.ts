import { ErrorConfig, createResultarError } from './error.js'
import { ResultAsync, errAsync } from './result-async.js'

interface Ok<T> {
  ok: true
  value: T
}

interface Err<E> {
  ok: false
  error: E
}

export class Result<T, E> {
  /**
   * Wraps a function with a try catch, creating a new function with the same
   * arguments but returning `Ok` if successful, `Err` if the function throws
   *
   * @param fn function to wrap with ok on success or err on failure
   * @param errorFn when an error is thrown, this will wrap the error result if provided
   */
  static fromThrowable<Fn extends (...args: readonly any[]) => unknown, E>(
    fn: Fn,
    errorFn?: (e: any) => E,
  ): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E> {
    return (...args) => {
      try {
        const result = fn(...args)
        return ok(result as ReturnType<Fn>)
      } catch (error) {
        if (errorFn) {
          return err(errorFn(error))
        }

        return err(error as E)
      }
    }
  }

  static ok<T, E=never>(value: T): Result<T, E> {
    return new Result<T, E>({ ok: true, value })
  }

  static err<T=never, E=unknown>(error: E): Result<T, E> {
    return new Result<T, E>({ ok: false, error })
  }

  readonly value: T
  readonly error: E

  private constructor(private readonly state: Ok<T> | Err<E>) {
    if (state.ok) {
      this.value = state.value
      this.error = undefined as E
    } else {
      this.error = state.error
      this.value = undefined as T
    }
  }

  /**
   * Used to check if a `Result` is an `OK`
   *
   * @returns `true` if the result is an `OK` variant of Result
   */
  isOk(): boolean {
    return this.state.ok
  }

  /**
   * Used to check if a `Result` is an `Err`
   *
   * @returns `true` if the result is an `Err` variant of Result
   */
  isErr(): boolean {
    return !this.state.ok
  }

  /**
   * Maps a `Result<T, E>` to `Result<U, E>`
   * by applying a function to a contained `Ok` value, leaving an `Err` value
   * untouched.
   *
   * @param f The function to apply an `OK` value
   * @returns the result of applying `f` or an `Err` untouched
   */
  map<X, Y>(f: (t: T) => Exclude<X, Promise<any>>): Result<X, E | Y>
  map<X>(f: (t: T) => Exclude<X, Promise<any>>): Result<X, E> {
    if (this.state.ok) {
      const value = f(this.value)
      return ok(value)
    }

    return err(this.error as Exclude<E, Promise<any>>)
  }

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a
   * contained `Err` value, leaving an `Ok` value untouched.
   *
   * This function can be used to pass through a successful result while
   * handling an error.
   *
   * @param f a function to apply to the error `Err` value
   */
  mapErr<X>(fn: (t: Exclude<E, Promise<any>>) => Exclude<X, Promise<any>>): Result<T, X> {
    if (this.state.ok) {
      return ok(this.value as Exclude<T, Promise<any>>)
    }

    return err(fn(this.error as Exclude<E, Promise<any>>))
  }

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
  andThen<X, Y>(f: (t: T) => Exclude<Result<X, Y>, Promise<any>>): Result<X, E | Y>
  andThen<X, Y>(f: (t: T) => Exclude<Result<X, Y>, Promise<any>>): Result<X, E | Y> {
    if (this.state.ok) {
      return f(this.value)
    }

    return err(this.error as Exclude<E, Promise<any>>)
  }

  /**
   * Takes an `Err` value and maps it to a `Result<T, SomeNewType>`.
   *
   * This is useful for error recovery.
   *
   *
   * @param f  A function to apply to an `Err` value, leaving `Ok` values
   * untouched.
   */
  orElse<Y>(f: (t: E) => Result<T, Y>): Result<T, Y>
  orElse<Y>(f: (t: E) => Result<T, Y>): Result<T, E | Y> {
    if (this.state.ok) {
      return ok(this.value as Exclude<T, Promise<any>>)
    }

    return f(this.error)
  }

  /**
   * Similar to `map` Except you must return a new `Result`.
   *
   * This is useful for when you need to do a subsequent async computation using
   * the inner `T` value, but that computation might fail. Must return a ResultAsync
   *
   * @param f The function that returns a `ResultAsync` to apply to the current
   * value
   */
  asyncAndThen<X, Y>(f: (t: T) => ResultAsync<X, Y>): ResultAsync<X, E | Y>
  asyncAndThen<X, Y>(f: (t: T) => ResultAsync<X, E>): ResultAsync<X, E | Y> {
    if (this.state.ok) {
      return f(this.value)
    }

    return errAsync(this.error)
  }

  /**
   * Maps a `Result<T, E>` to `ResultAsync<U, E>`
   * by applying an async function to a contained `Ok` value, leaving an `Err`
   * value untouched.
   *
   * @param f An async function to apply an `OK` value
   */
  asyncMap<X>(f: (t: T) => Promise<X>): ResultAsync<X, E> {
    if (this.state.ok) {
      return ResultAsync.fromSafePromise(f(this.value))
    }

    return errAsync(this.error)
  }

  /**
   * Unwrap the `Ok` value, or return the default if there is an `Err`
   *
   * @param v the default value to return if there is an `Err`
   */
  unwrapOr<A>(defaultValue: A): T | A {
    if (this.state.ok) {
      return this.value
    }

    return defaultValue
  }

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
  match<X>(fnOk: (t: T) => X, fnErr: (e: E) => X): X {
    if (this.state.ok) {
      return fnOk(this.value)
    }

    return fnErr(this.error)
  }

  /**
   * **This method is unsafe, and should only be used in a test environments**
   *
   * Takes a `Result<T, E>` and returns a `T` when the result is an `Ok`, otherwise it throws a custom object.
   *
   * @param config
   */
  _unsafeUnwrap(config?: ErrorConfig): T {
    if (this.state.ok) {
      return this.value
    }

    throw createResultarError('Called `_unsafeUnwrap` on an Err', this, config) // eslint-disable-line @typescript-eslint/no-throw-literal
  }

  /**
   * **This method is unsafe, and should only be used in a test environments**
   *
   * takes a `Result<T, E>` and returns a `E` when the result is an `Err`,
   * otherwise it throws a custom object.
   *
   * @param config
   */
  _unsafeUnwrapErr(config?: ErrorConfig): E {
    if (this.state.ok) {
      throw createResultarError('Called `_unsafeUnwrapErr` on an Ok', this, config) // eslint-disable-line @typescript-eslint/no-throw-literal
    }

    return this.error
  }
}

export const ok = <T, E = never>(value: T): Result<T, E> => Result.ok(value)
export const err = <T = never, E = unknown>(error: E): Result<T, E> => Result.err(error)
export const fromThrowable = <Fn extends (...args: readonly any[]) => unknown, E>(
  fn: Fn,
  errorFn?: (e: any) => E,
): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E> => Result.fromThrowable(fn, errorFn)

/**
 * Evaluates the given generator to a Result returned or an Err yielded from it,
 * whichever comes first.
 *
 * This function, in combination with `Result.safeUnwrap()`, is intended to emulate
 * Rust's ? operator.
 * See `/tests/safeTry.test.ts` for examples.
 *
 * @param body - What is evaluated. In body, `yield* result.safeUnwrap()` works as
 * Rust's `result?` expression.
 * @returns The first occurence of either an yielded Err or a returned Result.
 */
export function safeTry<T, E>(body: () => Generator<Result<T, E>, Result<T, E>>): Result<T, E>
/**
 * Evaluates the given generator to a Result returned or an Err yielded from it,
 * whichever comes first.
 *
 * This function, in combination with `Result.safeUnwrap()`, is intended to emulate
 * Rust's ? operator.
 * See `/tests/safeTry.test.ts` for examples.
 *
 * @param body - What is evaluated. In body, `yield* result.safeUnwrap()` and
 * `yield* resultAsync.safeUnwrap()` work as Rust's `result?` expression.
 * @returns The first occurence of either an yielded Err or a returned Result.
 */
// NOTE:
// Since body is potentially throwable because `await` can be used in it,
// Promise<Result<T, E>>, not ResultAsync<T, E>, is used as the return type.
export function safeTry<T, E>(
  body: () => AsyncGenerator<Result<T, E>, Result<T, E>>,
): Promise<Result<T, E>>
export function safeTry<T, E>(
  body:
  | (() => Generator<Result<T, E>, Result<T, E>>)
  | (() => AsyncGenerator<Result<T, E>, Result<T, E>>),
): Result<T, E> | Promise<Result<T, E>> {
  const n = body().next()
  if (n instanceof Promise) {
    return n.then(r => r.value)
  }

  return n.value
}

