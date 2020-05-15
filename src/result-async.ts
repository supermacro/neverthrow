import { Result, Ok, Err } from './'

export class ResultAsync<T, E> {
  private _promise: Promise<Result<T, E>>

  constructor(res: Promise<Result<T, E>>) {
    this._promise = res
  }

  static fromPromise<T, E>(promise: Promise<T>, errorFn?: (e: unknown) => E): ResultAsync<T, E> {
    let newPromise: Promise<Result<T, E>> = promise.then((value: T) => new Ok(value))
    if (errorFn) {
      newPromise = newPromise.catch(e => new Err<T, E>(errorFn(e)))
    }
    return new ResultAsync(newPromise)
  }

  map<A>(f: (t: T) => A | Promise<A>): ResultAsync<A, E> {
    const newPromise = this._promise.then(async (res: Result<T, E>) => {
      if (res.isErr()) {
        return new Err<A, E>(res.error)
      }

      return new Ok<A, E>(await f(res.value))
    })

    return new ResultAsync(newPromise)
  }

  mapErr<U>(f: (e: E) => U | Promise<U>): ResultAsync<T, U> {
    const newPromise = this._promise.then(async (res: Result<T, E>) => {
      if (res.isOk()) {
        return new Ok<T, U>(res.value)
      }

      return new Err<T, U>(await f(res.error))
    })

    return new ResultAsync(newPromise)
  }

  andThen<U>(f: (t: T) => Result<U, E> | ResultAsync<U, E>): ResultAsync<U, E> {
    const newPromise = this._promise.then(res => {
      if (res.isErr()) {
        return new Err<U, E>(res.error)
      }

      const newValue = f(res.value)

      return newValue instanceof ResultAsync ? newValue._promise : newValue
    })

    return new ResultAsync(newPromise)
  }

  match = <A>(ok: (t: T) => A, _err: (e: E) => A): Promise<A> => {
    return this._promise.then(res => res.match(ok, _err))
  }

  // Makes ResultAsync awaitable
  then<A>(successCallback: (res: Result<T, E>) => A): Promise<A> {
    return this._promise.then(successCallback)
  }
}

export const okAsync = <T, E>(value: T): ResultAsync<T, E> =>
  new ResultAsync(Promise.resolve(new Ok<T, E>(value)))

export const errAsync = <T, E>(err: E): ResultAsync<T, E> =>
  new ResultAsync(Promise.resolve(new Err<T, E>(err)))
