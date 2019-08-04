

export type Result<T, E>
= Ok<T, E>
| Err<T, E>



export const ok = <T, E>(value: T): Ok<T, E> => new Ok(value)

export const err = <T, E>(err: E): Err<T, E> => new Err(err)


export class Ok<T, E> {
  private value: T

  constructor(value: T) {
    this.value = value
  }

  isOk(): this is Ok<T, E> {
    return true
  }

  isErr(): this is Err<T, E> {
    return !this.isOk()
  }

  map<A>(f: (t: T) => A): Result<A, E> {
    return ok(f(this.value))
  }

  mapErr<U>(_f: (e: E) => U): Result<T, U> {
    return ok(this.value)
  }

  // add info on how this is really useful for converting a
  // Result<Result<T, E2>, E1>
  // into a Result<T, E2>
  andThen<U>(f: (t: T) => Result<U, E>): Result<U, E> {
    return f(this.value)
  }

  async asyncMap<U>(f: (t: T) => Promise<U>): Promise<Result<U, E>> {
    const newInner = await f(this.value)

    return ok(newInner)
  }

  // talk about match can be used to unwrap values in a typesafe way
  match = <U, A>(
    ok: (t: T) => U,
    _err: (e: E) => A
  ): U => {
    return ok(this.value)
  }

  // talk about how unwrapping defeats the purpose of Results
  _unsafeUnwrap(): T {
    return this.value
  }

  _unsafeUnwrapErr(): E {
    throw new Error('Called `_unsafeUnwrapErr` on an Ok')
  }
}

export class Err<T, E> {
  private error: E

  constructor(error: E) {
    this.error = error
  }

  isOk(): this is Ok<T, E> {
    return false
  }

  isErr(): this is Err<T, E> {
    return !this.isOk()
  }

  map<A>(_f: (t: T) => A): Result<A, E> {
    return err(this.error)
  }

  mapErr<U>(f: (e: E) => U): Result<T, U> {
    return err(f(this.error))
  }

  andThen<U>(_f: (t: T) => Result<U, E>): Result<U, E> {
    return err(this.error)
  }

  async asyncMap<U>(_f: (t: T) => Promise<U>): Promise<Result<U, E>> {
    return err(this.error)
  }

  match = <U, A>(
    _ok: (t: T) => U,
    err: (e: E) => A
  ): A => {
    return err(this.error)
  }

  _unsafeUnwrap(): T {
    throw new Error('Called `_unsafeUnwrap` on an Err')
  }

  _unsafeUnwrapErr(): E {
    return this.error
  }
}

