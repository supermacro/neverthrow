
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { describe, it, mock } from 'node:test'
import assert, {
  equal, deepEqual, strictEqual, deepStrictEqual, notDeepStrictEqual, ok as isTrue, notEqual,
} from 'node:assert'
import {
  Result, err, ok,
} from '../src/result.js'
import { ResultAsync, errAsync, okAsync } from '../src/result-async.js'

const validateUser = (user: Readonly<{name: string}>): ResultAsync<{name: string}, string> => {
  if (user.name === 'superadmin') {
    return errAsync('You are not allowed to register')
  }

  return okAsync(user)
}

await describe('Result.Ok', async () => {
  await it('Creates an Ok value', () => {
    const okVal = ok(12)

    equal(okVal.isOk(), true)
    equal(okVal.isErr(), false)
    ok(okVal instanceof Result)
  })

  await it('Creates an Ok value with null', () => {
    const okVal = ok(null)

    equal(okVal.isOk(), true)
    equal(okVal.isErr(), false)
    equal(okVal._unsafeUnwrap(), null)
  })

  await it('Creates an Ok value with undefined', () => {
    const okVal = ok(undefined)
    equal(okVal.isOk(), true)
    equal(okVal.isErr(), false)
    equal(okVal._unsafeUnwrap(), undefined) // eslint-disable-line @typescript-eslint/no-confusing-void-expression
  })

  await it('Is comparable', () => {
    deepStrictEqual(ok(42), ok(42))
    notDeepStrictEqual(ok(42), ok(43))
  })

  await it('Maps over an Ok value', () => {
    const value = 12
    const okVal = ok(value)

    const mapFn = mock.fn(String)

    const mapped = okVal.map(mapFn)

    isTrue(mapped.isOk())
    equal(mapped._unsafeUnwrap(), '12')
    equal(mapFn.mock.calls.length, 1)
  })

  await it('Skips `mapErr`', () => {
    const mapErrorFunc = mock.fn(String)

    const notMapped = ok(12).mapErr(mapErrorFunc)

    isTrue(notMapped.isOk())
    equal(mapErrorFunc.mock.calls.length, 0)
  })

  await describe('andThen', async () => {
    await it('Maps to an Ok', async () => {
      const okVal = ok(12)

      const data = { data: 'why not' }

      const flattened = okVal.andThen(_number =>
        // ...
        // complex logic
        // ...
        ok(data),
      )

      isTrue(flattened.isOk())
      strictEqual(flattened._unsafeUnwrap(), data)
    })

    await it('Maps to an Err', () => {
      const okval = ok(12)

      const flattened = okval.andThen(_number =>
        // ...
        // complex logic
        // ...
        err('Whoopsies!'),
      )

      const nextFn = mock.fn(_val => ok('noop'))

      equal(flattened.isOk(), false)

      flattened.andThen(nextFn)

      equal(nextFn.mock.callCount.length, 0)
    })
  })

  await describe('orElse', async () => {
    await it('Skips orElse on an Ok value', async () => {
      const okVal = ok(12)
      const errorCallback = mock.fn(_val => err('It is now a string'))
      deepEqual(okVal.orElse(errorCallback), ok(12))
      equal(errorCallback.mock.calls.length, 0)
    })
  })

  await it('unwrapOr and return the Ok value', async () => {
    const okVal = ok(12)
    equal(okVal.unwrapOr(1), 12)
  })

  await it('Maps to a ResultAsync', async () => {
    const okVal = ok(12)

    const flattened = okVal.asyncAndThen(_number =>
      // ...
      // complex async logic
      // ...
      okAsync({ data: 'why not' }),
    )

    isTrue(flattened instanceof ResultAsync)

    const newResult = await flattened

    isTrue(newResult.isOk())
    deepEqual(newResult._unsafeUnwrap(), { data: 'why not' })
  })

  await it('Maps to a promise', async () => {
    const asyncMapper = mock.fn(async (_val: number) => 'Very Nice!')

    const okVal = ok(12)

    const promise = okVal.asyncMap(asyncMapper)

    isTrue(promise instanceof ResultAsync)

    const newResult = await promise

    isTrue(newResult.isOk())
    equal(newResult._unsafeUnwrap(), 'Very Nice!')
    equal(asyncMapper.mock.calls.length, 1)
  })

  await it('Matches on an Ok', () => {
    const okMapper = mock.fn(_val => 'weeeeee')
    const errMapper = mock.fn(_val => 'wooooo')

    const matched = ok(12).match(okMapper, errMapper)

    equal(matched, 'weeeeee')
    equal(okMapper.mock.calls.length, 1)
    equal(errMapper.mock.calls.length, 0)
  })

  await it('Unwraps without issue', () => {
    const okVal = ok(12)

    equal(okVal._unsafeUnwrap(), 12)
  })

  await it('Can read the value after narrowing', () => {
    const fallible: () => Result<string, number> = () => ok('safe to read')
    const val = fallible()

    // After this check we val is narrowed to Ok<string, number>. Without this
    // line TypeScript will not allow accessing val.value.
    if (val.isErr()) {
      return
    }

    equal(val.value, 'safe to read')
  })
})

await describe('Result.Err', async () => {
  await it('Creates an Err value', () => {
    const errVal = err('I have you now.')

    equal(errVal.isOk(), false)
    isTrue(errVal.isErr())
    isTrue(typeof errVal.error === 'string')
  })

  await it('Is comparable', () => {
    deepEqual(err(42), err(42))
    notEqual(err(42), err(43))
  })

  await it('Skips `map`', () => {
    const errVal = err('I am your father')

    const mapper = mock.fn(_value => 'noooo')

    const hopefullyNotMapped = errVal.map(mapper)

    isTrue(hopefullyNotMapped.isErr())
    equal(mapper.mock.calls.length, 0)
    equal(hopefullyNotMapped._unsafeUnwrapErr(), errVal._unsafeUnwrapErr())
  })

  await it('Maps over an Err', () => {
    const errVal = err('Round 1, Fight!')

    const mapper = mock.fn((error: string) => error.replace('1', '2'))

    const mapped = errVal.mapErr(mapper)

    isTrue(mapped.isErr())
    equal(mapper.mock.calls.length, 1)
    notEqual(mapped._unsafeUnwrapErr(), errVal._unsafeUnwrapErr())
  })

  await it('unwrapOr and return the default value', () => {
    const okVal = err<number, string>('Oh nooo')
    equal(okVal.unwrapOr(1), 1)
  })

  await it('Skips over andThen', () => {
    const errVal = err('Yolo')

    const mapper = mock.fn(_val => ok<string, string>('yooyo'))

    const hopefullyNotFlattened = errVal.andThen(mapper)

    isTrue(hopefullyNotFlattened.isErr())
    equal(mapper.mock.calls.length, 0)
    equal(errVal._unsafeUnwrapErr(), 'Yolo')
  })

  await it('Transforms error into ResultAsync within `asyncAndThen`', async () => {
    const errVal = err('Yolo')

    const asyncMapper = mock.fn(_val => okAsync<string, string>('yooyo'))

    const hopefullyNotFlattened = errVal.asyncAndThen(asyncMapper)

    equal(hopefullyNotFlattened instanceof ResultAsync, true)

    equal(asyncMapper.mock.calls.length, 0)

    const syncResult = await hopefullyNotFlattened
    equal(syncResult._unsafeUnwrapErr(), 'Yolo')
  })

  await it('Does not invoke callback within `asyncMap`', async () => {
    const asyncMapper = mock.fn(async _val =>
    // ...
    // complex logic
    // ..

      // db queries
      // network calls
      // disk io
      // etc ...
      'Very Nice!',
    )

    const errVal = err('nooooooo')

    const promise = errVal.asyncMap(asyncMapper)

    isTrue(promise instanceof ResultAsync)

    const sameResult = await promise

    isTrue(sameResult.isErr())
    equal(asyncMapper.mock.calls.length, 0)
    equal(sameResult._unsafeUnwrapErr(), errVal._unsafeUnwrapErr())
  })

  await it('Matches on an Err', () => {
    const okMapper = mock.fn(_val => 'weeeeee')
    const errMapper = mock.fn(_val => 'wooooo')

    const matched = err(12).match(okMapper, errMapper)

    equal(matched, 'wooooo')
    equal(okMapper.mock.calls.length, 0)
    equal(errMapper.mock.calls.length, 1)
  })

  await it('Throws when you unwrap an Err', () => {
    const errVal = err('woopsies')

    assert.throws(() => {
      errVal._unsafeUnwrap()
    }, { data: { type: 'Err', value: 'woopsies' }, message: 'Called `_unsafeUnwrap` on an Err', stack: undefined })
  })

  await it('Unwraps without issue', () => {
    const okVal = err(12)

    equal(okVal._unsafeUnwrapErr(), 12)
  })

  await describe('orElse', async () => {
    await it('invokes the orElse callback on an Err value', async () => {
      const okVal = err('BOOOM!')
      const errorCallback = mock.fn(_errVal => err(true))

      deepEqual(okVal.orElse(errorCallback), err(true))
      equal(errorCallback.mock.calls.length, 1)
    })
  })
})

await describe('ResultAsync', async () => {
  await it('Is awaitable to a Result', async () => {
    // For a success value
    const asyncVal = okAsync(12)
    equal(asyncVal instanceof ResultAsync, true)

    const val = await asyncVal

    equal(val._unsafeUnwrap(), 12)

    // For an error
    const asyncErr = errAsync('Wrong format')
    isTrue(asyncErr instanceof ResultAsync)

    const err = await asyncErr

    isTrue(err.isErr())
    equal(err._unsafeUnwrapErr(), 'Wrong format')
  })

  await describe('acting as a Promise<Result>', async () => {
    await it('Is chainable like any Promise', async () => {
      // For a success value
      const asyncValChained = okAsync(12).then(res => {
        if (res.isOk()) {
          return res.value + 2
        }
      })

      equal(asyncValChained instanceof Promise, true)
      const val = await asyncValChained
      equal(val, 14)

      // For an error
      const asyncErrChained = errAsync('Oops').then(res => {
        if (res.isErr()) {
          return res.error + '!'
        }
      })

      equal(asyncErrChained instanceof Promise, true)
      const err = await asyncErrChained
      equal(err, 'Oops!')
    })

    await it('Can be used with Promise.all', async () => {
      const allResult = await Promise.all([okAsync<string, Error>('1')])

      // expect(allResult).toHaveLength(1)
      equal(allResult.length, 1)
      // expect(allResult[0]).toBeInstanceOf(Ok)
      equal(allResult[0] instanceof Result, true)
      if (!(allResult[0] instanceof Result)) {
        return
      }

      // expect(allResult[0].isOk()).toBe(true)
      isTrue(allResult[0].isOk())
      // expect(allResult[0]._unsafeUnwrap()).toEqual('1')
      equal(allResult[0]._unsafeUnwrap(), '1')
    })
  })

  await describe('map', async () => {
    await it('Maps a value using a synchronous function', async () => {
      const asyncVal = okAsync(12)
      const mapSyncFn = mock.fn((v: number) => v.toString())
      const mapped = asyncVal.map(mapSyncFn)
      isTrue(mapped instanceof ResultAsync)
      const newVal = await mapped
      isTrue(newVal.isOk())
      equal(newVal._unsafeUnwrap(), '12')
      equal(mapSyncFn.mock.calls.length, 1)
    })
  })

  await it('Maps a value using an asynchronous function', async () => {
    const asyncVal = okAsync(12)

    const mapAsyncFn = mock.fn(async (v: number) => v.toString())

    const mapped = asyncVal.map(mapAsyncFn)

    isTrue(mapped instanceof ResultAsync)

    const newVal = await mapped

    isTrue(newVal.isOk())
    equal(newVal._unsafeUnwrap(), '12')
    equal(mapAsyncFn.mock.calls.length, 1)
  })

  await it('Skips an error', async () => {
    const asyncErr = errAsync<number, string>('Wrong format')

    const mapSyncFn = mock.fn((v: number) => v.toString())

    const notMapped = asyncErr.map(mapSyncFn)

    isTrue(notMapped instanceof ResultAsync)

    const newVal = await notMapped

    isTrue(newVal.isErr())
    equal(newVal._unsafeUnwrapErr(), 'Wrong format')
    equal(mapSyncFn.mock.calls.length, 0)
  })

  await describe('mapErr', async () => {
    await it('Maps an error using a synchronous function', async () => {
      const asyncErr = errAsync('Wrong format')

      const mapErrSyncFn = mock.fn((str: string) => 'Error: '.concat(str))

      const mappedErr = asyncErr.mapErr(mapErrSyncFn)

      isTrue(mappedErr instanceof ResultAsync)

      const newVal = await mappedErr

      isTrue(newVal.isErr())
      equal(newVal._unsafeUnwrapErr(), 'Error: Wrong format')
      equal(mapErrSyncFn.mock.calls.length, 1)
    })

    await it('Maps an error using an asynchronous function', async () => {
      const asyncErr = errAsync('Wrong format')

      const mapErrAsyncFn = mock.fn(async (str: string) => 'Error: '.concat(str))

      const mappedErr = asyncErr.mapErr(mapErrAsyncFn)

      isTrue(mappedErr instanceof ResultAsync)

      const newVal = await mappedErr

      isTrue(newVal.isErr())
      equal(newVal._unsafeUnwrapErr(), 'Error: Wrong format')
      equal(mapErrAsyncFn.mock.calls.length, 1)
    })

    await it('Skips a value', async () => {
      const asyncVal = okAsync(12)

      const mapErrSyncFn = mock.fn((str: string) => 'Error: '.concat(str))

      const notMapped = asyncVal.mapErr(mapErrSyncFn)

      isTrue(notMapped instanceof ResultAsync)

      const newVal = await notMapped

      isTrue(newVal.isOk())
      equal(newVal._unsafeUnwrap(), 12)
      equal(mapErrSyncFn.mock.calls.length, 0)
    })

    await it('Andthen chainning errors', async () => {
      const createUser = mock.fn((v: { name: string }) => okAsync(v.name))
      const result = await validateUser({ name: 'superadmin' }).andThen(createUser)
      equal(result._unsafeUnwrapErr(), 'You are not allowed to register')
    })

    await it('Andthen chaining success', async () => {
      const createUser = mock.fn((v: { name: string }) => okAsync('Welcome '.concat(v.name)))
      const result = await validateUser({ name: 'Elizeu Drummond' }).andThen(createUser)
      equal(result._unsafeUnwrap(), 'Welcome Elizeu Drummond')
    })
  })

  await describe('Result.fromThrowable', async () => {
    await it('Parser JSON', async () => {
      const safeJSONParse = (text: string, reviver?: (this: unknown, key: string, value: unknown) => unknown) => Result.fromThrowable(JSON.parse, () => 'parser error')(text, reviver) as Result<{name: string}, string>

      const result = safeJSONParse('{"name": "Elizeu Drummond"}')

      isTrue(result.isOk())
      deepEqual(result._unsafeUnwrap(), { name: 'Elizeu Drummond' })
    })

    await it('Creates a function that returns an OK result when the inner function does not throw', async () => {
      const hello = (): string => 'hello'
      const safeHello = Result.fromThrowable(hello)

      const result = hello()
      const safeResult = safeHello()

      isTrue(safeResult.isOk())
      equal(result, safeResult._unsafeUnwrap())
    })

    await it('Accepts an inner function which takes arguments', async () => {
      const hello = (fname: string): string => `hello, ${fname}`
      const safeHello = Result.fromThrowable(hello)

      const result = hello('Dikembe')
      const safeResult = safeHello('Dikembe')

      isTrue(safeResult.isOk())
      equal(result, safeResult._unsafeUnwrap())
    })

    await it('Creates a function that returns an err when the inner function throws', async () => {
      const thrower = (): string => {
        throw new Error() // eslint-disable-line unicorn/error-message
      }

      // type: () => Result<string, unknown>
      // received types from thrower fn, no errorFn is provides therefore Err type is unknown
      const safeThrower = Result.fromThrowable(thrower)
      const result = safeThrower()

      isTrue(result.isErr())
      isTrue(result._unsafeUnwrapErr() instanceof Error)
    })

    await it('Accepts an error handler as a second argument', async () => {
      const thrower = (): string => {
        throw new Error() // eslint-disable-line unicorn/error-message
      }

    type MessageObject = { message: string }
    const toMessageObject = (): MessageObject => ({ message: 'error' })

    // type: () => Result<string, MessageObject>
    // received types from thrower fn and errorFn return type
    const safeThrower = Result.fromThrowable(thrower, toMessageObject)
    const result = safeThrower()

    isTrue(result.isErr())
    isTrue(!result.isOk())
    isTrue(result instanceof Result)
    deepEqual(result._unsafeUnwrapErr(), { message: 'error' })
    })
  })

  await it('From promise rejected', async () => {
    const x = await ResultAsync.fromPromise(Promise.reject('No!'), String)
    isTrue(x.isErr())
    equal(x.error, 'No!')
  })

  await it('From promise rejected destructuring', async () => {
    const getUserName = async (): Promise<{user: string}> => ({ user: 'Elizeu Drummond' })

    const x = getUserName()
    const user = ResultAsync.fromPromise(x, () => 'No!')
      .andThen(({ user }) => okAsync(user))

    const result = await user

    if (result.isErr()) {
      isTrue(result.isErr())
      equal(result.error, 'No!')
    }

    isTrue(result._unsafeUnwrap(), 'Elizeu Drummond')
  })

  await it('From promise ok', async () => {
    const x = await ResultAsync.fromPromise(Promise.resolve('Yes!'), e => new Error('Oops: ' + String(e)))
    isTrue(x.isOk())
    type R = string
    if (x.isOk()) {
      const r: R = x.value
      equal(r, 'Yes!')
    }

    if (x.isErr()) {
      const r = x.error
      equal(r, 'No!')
    }
  })

  await it('From promise error', async () => {
    const x = await ResultAsync.fromPromise(Promise.reject('boom'), e => 'Oops: ' + String(e))

    type R = string
    if (x.isErr()) {
      const r: R = x.error
      equal(r, 'Oops: boom')
    }
  })
})

