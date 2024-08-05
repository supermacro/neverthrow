import * as td from 'testdouble'

import {
  err,
  Err,
  errAsync,
  fromAsyncThrowable,
  fromPromise,
  fromSafePromise,
  fromThrowable,
  ok,
  Ok,
  okAsync,
  Result,
  ResultAsync,
} from '../src'

describe('Result.Ok', () => {
  it('Creates an Ok value', () => {
    const okVal = ok(12)

    expect(okVal.isOk()).toBe(true)
    expect(okVal.isErr()).toBe(false)
    expect(okVal).toBeInstanceOf(Ok)
  })

  it('Creates an Ok value with null', () => {
    const okVal = ok(null)

    expect(okVal.isOk()).toBe(true)
    expect(okVal.isErr()).toBe(false)
    expect(okVal._unsafeUnwrap()).toBe(null)
  })

  it('Creates an Ok value with undefined', () => {
    const okVal = ok(undefined)

    expect(okVal.isOk()).toBe(true)
    expect(okVal.isErr()).toBe(false)
    expect(okVal._unsafeUnwrap()).toBeUndefined()
  })

  it('Is comparable', () => {
    expect(ok(42)).toEqual(ok(42))
    expect(ok(42)).not.toEqual(ok(43))
  })

  it('Maps over an Ok value', () => {
    const okVal = ok(12)
    const mapFn = jest.fn((number) => number.toString())

    const mapped = okVal.map(mapFn)

    expect(mapped.isOk()).toBe(true)
    expect(mapped._unsafeUnwrap()).toBe('12')
    expect(mapFn).toHaveBeenCalledTimes(1)
  })

  it('Skips `mapErr`', () => {
    const mapErrorFunc = jest.fn((_error) => 'mapped error value')

    const notMapped = ok(12).mapErr(mapErrorFunc)

    expect(notMapped.isOk()).toBe(true)
    expect(mapErrorFunc).not.toHaveBeenCalledTimes(1)
  })

  describe('andThen', () => {
    it('Maps to an Ok', () => {
      const okVal = ok(12)

      const flattened = okVal.andThen((_number) => {
        // ...
        // complex logic
        // ...
        return ok({ data: 'why not' })
      })

      expect(flattened.isOk()).toBe(true)
      expect(flattened._unsafeUnwrap()).toStrictEqual({ data: 'why not' })
    })

    it('Maps to an Err', () => {
      const okval = ok(12)

      const flattened = okval.andThen((_number) => {
        // ...
        // complex logic
        // ...
        return err('Whoopsies!')
      })

      expect(flattened.isOk()).toBe(false)

      const nextFn = jest.fn((_val) => ok('noop'))

      flattened.andThen(nextFn)

      expect(nextFn).not.toHaveBeenCalled()
    })
  })

  describe('andFinally', () => {
    it('Maps to an Ok', () => {
      const okVal = ok(1)
      type ExpectedType = Result<boolean, never>
      const flattened: ExpectedType = okVal.andFinally((_number) => {
        return ok(true)
      })

      expect(flattened.isOk()).toBe(true)
      expect(flattened._unsafeUnwrap()).toStrictEqual(true)
    })

    it('Maps to an Err', () => {
      const okVal = ok('opening db connection')
      type ExpectedType = Result<never, string>
      const flattened: ExpectedType = okVal
        .andThen(() => {
          return ok('do something')
        })
        .andFinally((_number) => {
          return err('error closing database connection')
        })
      expect(flattened.isErr()).toBe(true)
      expect(flattened._unsafeUnwrapErr()).toStrictEqual('error closing database connection')
    })

    it('Maps to an Result', () => {
      const okVal = ok('opening db connection')
      type ExpectedType = Result<string, Error>
      const flattened: ExpectedType = okVal
        .andThen(() => {
          return ok('do something')
        })
        .andFinally((_number) => {
          const closeDbConnection: Result<'ok', Error> = ok('ok')
          return closeDbConnection
        })
      expect(flattened.isOk()).toBe(true)
      expect(flattened._unsafeUnwrap()).toStrictEqual('ok')
    })
  })

  describe('orElse', () => {
    it('Skips orElse on an Ok value', () => {
      const okVal = ok(12)
      const errorCallback = jest.fn((_errVal) => err<number, string>('It is now a string'))

      expect(okVal.orElse(errorCallback)).toEqual(ok(12))
      expect(errorCallback).not.toHaveBeenCalled()
    })
  })

  it('unwrapOr and return the Ok value', () => {
    const okVal = ok(12)
    expect(okVal.unwrapOr(1)).toEqual(12)
  })

  it('Maps to a ResultAsync', async () => {
    const okVal = ok(12)

    const flattened = okVal.asyncAndThen((_number) => {
      // ...
      // complex async logic
      // ...
      return okAsync({ data: 'why not' })
    })

    expect(flattened).toBeInstanceOf(ResultAsync)

    const newResult = await flattened

    expect(newResult.isOk()).toBe(true)
    expect(newResult._unsafeUnwrap()).toStrictEqual({ data: 'why not' })
  })

  it('Maps to a promise', async () => {
    const asyncMapper = jest.fn((_val) => {
      // ...
      // complex logic
      // ..

      // db queries
      // network calls
      // disk io
      // etc ...
      return Promise.resolve('Very Nice!')
    })

    const okVal = ok(12)

    const promise = okVal.asyncMap(asyncMapper)

    expect(promise).toBeInstanceOf(ResultAsync)

    const newResult = await promise

    expect(newResult.isOk()).toBe(true)
    expect(asyncMapper).toHaveBeenCalledTimes(1)
    expect(newResult._unsafeUnwrap()).toStrictEqual('Very Nice!')
  })

  it('Matches on an Ok', () => {
    const okMapper = jest.fn((_val) => 'weeeeee')
    const errMapper = jest.fn((_val) => 'wooooo')

    const matched = ok(12).match(okMapper, errMapper)

    expect(matched).toBe('weeeeee')
    expect(okMapper).toHaveBeenCalledTimes(1)
    expect(errMapper).not.toHaveBeenCalled()
  })

  it('Unwraps without issue', () => {
    const okVal = ok(12)

    expect(okVal._unsafeUnwrap()).toBe(12)
  })

  it('Can read the value after narrowing', () => {
    const fallible: () => Result<string, number> = () => ok('safe to read')
    const val = fallible()

    // After this check we val is narrowed to Ok<string, number>. Without this
    // line TypeScript will not allow accessing val.value.
    if (val.isErr()) return

    expect(val.value).toBe('safe to read')
  })
})

describe('Result.Err', () => {
  it('Creates an Err value', () => {
    const errVal = err('I have you now.')

    expect(errVal.isOk()).toBe(false)
    expect(errVal.isErr()).toBe(true)
    expect(errVal).toBeInstanceOf(Err)
  })

  it('Is comparable', () => {
    expect(err(42)).toEqual(err(42))
    expect(err(42)).not.toEqual(err(43))
  })

  it('Skips `map`', () => {
    const errVal = err('I am your father')

    const mapper = jest.fn((_value) => 'noooo')

    const hopefullyNotMapped = errVal.map(mapper)

    expect(hopefullyNotMapped.isErr()).toBe(true)
    expect(mapper).not.toHaveBeenCalled()
    expect(hopefullyNotMapped._unsafeUnwrapErr()).toEqual(errVal._unsafeUnwrapErr())
  })

  it('Maps over an Err', () => {
    const errVal = err('Round 1, Fight!')

    const mapper = jest.fn((error: string) => error.replace('1', '2'))

    const mapped = errVal.mapErr(mapper)

    expect(mapped.isErr()).toBe(true)
    expect(mapper).toHaveBeenCalledTimes(1)
    expect(mapped._unsafeUnwrapErr()).not.toEqual(errVal._unsafeUnwrapErr())
  })

  it('unwrapOr and return the default value', () => {
    const okVal = err<number, string>('Oh nooo')
    expect(okVal.unwrapOr(1)).toEqual(1)
  })

  it('Skips over andThen', () => {
    const errVal = err('Yolo')

    const mapper = jest.fn((_val) => ok<string, string>('yooyo'))

    const hopefullyNotFlattened = errVal.andThen(mapper)

    expect(hopefullyNotFlattened.isErr()).toBe(true)
    expect(mapper).not.toHaveBeenCalled()
    expect(errVal._unsafeUnwrapErr()).toEqual('Yolo')
  })

  it('Transforms error into ResultAsync within `asyncAndThen`', async () => {
    const errVal = err('Yolo')

    const asyncMapper = jest.fn((_val) => okAsync<string, string>('yooyo'))

    const hopefullyNotFlattened = errVal.asyncAndThen(asyncMapper)

    expect(hopefullyNotFlattened).toBeInstanceOf(ResultAsync)
    expect(asyncMapper).not.toHaveBeenCalled()

    const syncResult = await hopefullyNotFlattened
    expect(syncResult._unsafeUnwrapErr()).toEqual('Yolo')
  })

  it('Does not invoke callback within `asyncMap`', async () => {
    const asyncMapper = jest.fn((_val) => {
      // ...
      // complex logic
      // ..

      // db queries
      // network calls
      // disk io
      // etc ...
      return Promise.resolve('Very Nice!')
    })

    const errVal = err('nooooooo')

    const promise = errVal.asyncMap(asyncMapper)

    expect(promise).toBeInstanceOf(ResultAsync)

    const sameResult = await promise

    expect(sameResult.isErr()).toBe(true)
    expect(asyncMapper).not.toHaveBeenCalled()
    expect(sameResult._unsafeUnwrapErr()).toEqual(errVal._unsafeUnwrapErr())
  })

  it('Matches on an Err', () => {
    const okMapper = jest.fn((_val) => 'weeeeee')
    const errMapper = jest.fn((_val) => 'wooooo')

    const matched = err(12).match(okMapper, errMapper)

    expect(matched).toBe('wooooo')
    expect(okMapper).not.toHaveBeenCalled()
    expect(errMapper).toHaveBeenCalledTimes(1)
  })

  it('Throws when you unwrap an Err', () => {
    const errVal = err('woopsies')

    expect(() => {
      errVal._unsafeUnwrap()
    }).toThrowError()
  })

  it('Unwraps without issue', () => {
    const okVal = err(12)

    expect(okVal._unsafeUnwrapErr()).toBe(12)
  })

  describe('orElse', () => {
    it('invokes the orElse callback on an Err value', () => {
      const okVal = err('BOOOM!')
      const errorCallback = jest.fn((_errVal) => err(true))

      expect(okVal.orElse(errorCallback)).toEqual(err(true))
      expect(errorCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('andFinally', () => {
    it('Maps to an ok value', () => {
      const okVal = ok('opening db connection').andThen(() => err('something went wrong'))
      type ExpectedType = Result<string, never>
      const flattened: ExpectedType = okVal.andFinally(() => {
        return ok('close db connection')
      })
      expect(flattened.isOk()).toBe(true)
      expect(flattened._unsafeUnwrap()).toStrictEqual('close db connection')
    })

    it('Maps to an ok value', () => {
      const okVal = ok('opening db connection').andThen(() => err('something went wrong'))
      type ExpectedType = Result<never, string>
      const flattened: ExpectedType = okVal.andFinally(() => {
        return err('noo')
      })
      expect(flattened.isErr()).toBe(true)
      expect(flattened._unsafeUnwrapErr()).toStrictEqual('noo')
    })

    it('Maps to an Result value', () => {
      const okVal = ok('opening db connection').andThen(() => err('something went wrong'))
      type ExpectedType = Result<string, string>
      const flattened: ExpectedType = okVal.andFinally(() => {
        const closeDbConnection: Result<string, string> = err('noo')
        return closeDbConnection
      })
      expect(flattened.isErr()).toBe(true)
      expect(flattened._unsafeUnwrapErr()).toStrictEqual('noo')
    })
  })
})

describe('Result.fromThrowable', () => {
  it('Creates a function that returns an OK result when the inner function does not throw', () => {
    const hello = (): string => 'hello'
    const safeHello = Result.fromThrowable(hello)

    const result = hello()
    const safeResult = safeHello()

    expect(safeResult).toBeInstanceOf(Ok)
    expect(result).toEqual(safeResult._unsafeUnwrap())
  })

  // Added for issue #300 -- the test here is not so much that expectations are met as that the test compiles.
  it('Accepts an inner function which takes arguments', () => {
    const hello = (fname: string): string => `hello, ${fname}`;
    const safeHello = Result.fromThrowable(hello);

    const result = hello('Dikembe');
    const safeResult = safeHello('Dikembe');

    expect(safeResult).toBeInstanceOf(Ok);
    expect(result).toEqual(safeResult._unsafeUnwrap());
  });

  it('Creates a function that returns an err when the inner function throws', () => {
    const thrower = (): string => {
      throw new Error()
    }

    // type: () => Result<string, unknown>
    // received types from thrower fn, no errorFn is provides therefore Err type is unknown
    const safeThrower = Result.fromThrowable(thrower)
    const result = safeThrower()

    expect(result).toBeInstanceOf(Err)
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
  })

  it('Accepts an error handler as a second argument', () => {
    const thrower = (): string => {
      throw new Error()
    }
    type MessageObject = { message: string }
    const toMessageObject = (): MessageObject => ({ message: 'error' })

    // type: () => Result<string, MessageObject>
    // received types from thrower fn and errorFn return type
    const safeThrower = Result.fromThrowable(thrower, toMessageObject)
    const result = safeThrower()

    expect(result.isOk()).toBe(false)
    expect(result.isErr()).toBe(true)
    expect(result).toBeInstanceOf(Err)
    expect(result._unsafeUnwrapErr()).toEqual({ message: 'error' })
  })

  it('has a top level export', () => {
      expect(fromThrowable).toBe(Result.fromThrowable)
  })
})

describe('Utils', () => {
  describe('`Result.combine`', () => {
    describe('Synchronous `combine`', () => {
      it('Combines a list of results into an Ok value', () => {
        const resultList = [ok(123), ok(456), ok(789)]

        const result = Result.combine(resultList)

        expect(result.isOk()).toBe(true)
        expect(result._unsafeUnwrap()).toEqual([123, 456, 789])
      })

      it('Combines a list of results into an Err value', () => {
        const resultList: Result<number, string>[] = [
          ok(123),
          err('boooom!'),
          ok(456),
          err('ahhhhh!'),
        ]

        const result = Result.combine(resultList)

        expect(result.isErr()).toBe(true)
        expect(result._unsafeUnwrapErr()).toBe('boooom!')
      })

      it('Combines heterogeneous lists', () => {
        type HeterogenousList = [ Result<string, string>, Result<number, number>, Result<boolean, boolean> ]

        const heterogenousList: HeterogenousList = [
          ok('Yooooo'),
          ok(123),
          ok(true),
        ]

        type ExpecteResult = Result<[ string, number, boolean ], string | number | boolean>

        const result: ExpecteResult = Result.combine(heterogenousList)

        expect(result._unsafeUnwrap()).toEqual(['Yooooo', 123, true])
      })

      it('Does not destructure / concatenate arrays', () => {
        type HomogenousList = [
          Result<string[], boolean>,
          Result<number[], string>,
        ]

        const homogenousList: HomogenousList = [
          ok(['hello', 'world']),
          ok([1, 2, 3])
        ]

        type ExpectedResult = Result<[ string[], number[] ], boolean | string>

        const result: ExpectedResult = Result.combine(homogenousList)

        expect(result._unsafeUnwrap()).toEqual([ [ 'hello', 'world' ], [ 1, 2, 3 ]])
      })
    })

    describe('`ResultAsync.combine`', () => {
      it('Combines a list of async results into an Ok value', async () => {
        const asyncResultList = [okAsync(123), okAsync(456), okAsync(789)]

        const resultAsync: ResultAsync<number[], never[]> = ResultAsync.combine(asyncResultList)
        
        expect(resultAsync).toBeInstanceOf(ResultAsync)

        const result = await ResultAsync.combine(asyncResultList)

        expect(result.isOk()).toBe(true)
        expect(result._unsafeUnwrap()).toEqual([123, 456, 789])
      })

      it('Combines a list of results into an Err value', async () => {
        const resultList: ResultAsync<number, string>[] = [
          okAsync(123),
          errAsync('boooom!'),
          okAsync(456),
          errAsync('ahhhhh!'),
        ]

        const result = await ResultAsync.combine(resultList)

        expect(result.isErr()).toBe(true)
        expect(result._unsafeUnwrapErr()).toBe('boooom!')
      })

      it('Combines heterogeneous lists', async () => {
        type HeterogenousList = [
          ResultAsync<string, string>,
          ResultAsync<number, number>,
          ResultAsync<boolean, boolean>,
          ResultAsync<number[], string>,
        ]

        const heterogenousList: HeterogenousList = [
          okAsync('Yooooo'),
          okAsync(123),
          okAsync(true),
          okAsync([ 1, 2, 3]),
        ]

        type ExpecteResult = Result<[ string, number, boolean, number[] ], string | number | boolean>

        const result: ExpecteResult = await ResultAsync.combine(heterogenousList)

        expect(result._unsafeUnwrap()).toEqual(['Yooooo', 123, true, [ 1, 2, 3 ]])
      })
    })
  })
  describe('`Result.combineWithAllErrors`', () => {
    describe('Synchronous `combineWithAllErrors`', () => {
      it('Combines a list of results into an Ok value', () => {
        const resultList = [ok(123), ok(456), ok(789)]

        const result = Result.combineWithAllErrors(resultList)

        expect(result.isOk()).toBe(true)
        expect(result._unsafeUnwrap()).toEqual([123, 456, 789])
      })

      it('Combines a list of results into an Err value', () => {
        const resultList: Result<number, string>[] = [
          ok(123),
          err('boooom!'),
          ok(456),
          err('ahhhhh!'),
        ]

        const result = Result.combineWithAllErrors(resultList)

        expect(result.isErr()).toBe(true)
        expect(result._unsafeUnwrapErr()).toEqual(['boooom!', 'ahhhhh!'])
      })

      it('Combines heterogeneous lists', () => {
        type HeterogenousList = [ Result<string, string>, Result<number, number>, Result<boolean, boolean> ]

        const heterogenousList: HeterogenousList = [
          ok('Yooooo'),
          ok(123),
          ok(true),
        ]

        type ExpecteResult = Result<[ string, number, boolean ], (string | number | boolean)[]>

        const result: ExpecteResult = Result.combineWithAllErrors(heterogenousList)

        expect(result._unsafeUnwrap()).toEqual(['Yooooo', 123, true])
      })

      it('Does not destructure / concatenate arrays', () => {
        type HomogenousList = [
          Result<string[], boolean>,
          Result<number[], string>,
        ]

        const homogenousList: HomogenousList = [
          ok(['hello', 'world']),
          ok([1, 2, 3])
        ]

        type ExpectedResult = Result<[ string[], number[] ], (boolean | string)[]>

        const result: ExpectedResult = Result.combineWithAllErrors(homogenousList)

        expect(result._unsafeUnwrap()).toEqual([ [ 'hello', 'world' ], [ 1, 2, 3 ]])
      })
    })
    describe('`ResultAsync.combineWithAllErrors`', () => {
      it('Combines a list of async results into an Ok value', async () => {
        const asyncResultList = [okAsync(123), okAsync(456), okAsync(789)]

        const result = await ResultAsync.combineWithAllErrors(asyncResultList)

        expect(result.isOk()).toBe(true)
        expect(result._unsafeUnwrap()).toEqual([123, 456, 789])
      })

      it('Combines a list of results into an Err value', async () => {
        const asyncResultList: ResultAsync<number, string>[] = [
          okAsync(123),
          errAsync('boooom!'),
          okAsync(456),
          errAsync('ahhhhh!'),
        ]

        const result = await ResultAsync.combineWithAllErrors(asyncResultList)

        expect(result.isErr()).toBe(true)
        expect(result._unsafeUnwrapErr()).toEqual(['boooom!', 'ahhhhh!'])
      })

      it('Combines heterogeneous lists', async () => {
        type HeterogenousList = [ ResultAsync<string, string>, ResultAsync<number, number>, ResultAsync<boolean, boolean> ]

        const heterogenousList: HeterogenousList = [
          okAsync('Yooooo'),
          okAsync(123),
          okAsync(true),
        ]

        type ExpecteResult = Result<[ string, number, boolean ], [string, number, boolean]>

        const result: ExpecteResult = await ResultAsync.combineWithAllErrors(heterogenousList)

        expect(result._unsafeUnwrap()).toEqual(['Yooooo', 123, true])
      })
    })

    describe('testdouble `ResultAsync.combine`', () => {
      interface ITestInterface {
        getName(): string
        setName(name: string): void
        getAsyncResult(): ResultAsync<ITestInterface, Error>
      }

      it('Combines `testdouble` proxies from mocks generated via interfaces', async () => {
        const mock = td.object<ITestInterface>()

        const result = await ResultAsync.combine([okAsync(mock)] as const)

        expect(result).toBeDefined()
        expect(result.isErr()).toBeFalsy()
        const unwrappedResult = result._unsafeUnwrap()

        expect(unwrappedResult.length).toBe(1)
        expect(unwrappedResult[0]).toBe(mock)
      })
    })
  })
})

describe('ResultAsync', () => {
  it('Is awaitable to a Result', async () => {
    // For a success value
    const asyncVal = okAsync(12)
    expect(asyncVal).toBeInstanceOf(ResultAsync)

    const val = await asyncVal

    expect(val).toBeInstanceOf(Ok)
    expect(val._unsafeUnwrap()).toEqual(12)

    // For an error
    const asyncErr = errAsync('Wrong format')
    expect(asyncErr).toBeInstanceOf(ResultAsync)

    const err = await asyncErr

    expect(err).toBeInstanceOf(Err)
    expect(err._unsafeUnwrapErr()).toEqual('Wrong format')
  })

  describe('acting as a Promise<Result>', () => {
    it('Is chainable like any Promise', async () => {
      // For a success value
      const asyncValChained = okAsync(12).then((res) => {
        if (res.isOk()) {
          return res.value + 2
        }
      })

      expect(asyncValChained).toBeInstanceOf(Promise)
      const val = await asyncValChained
      expect(val).toEqual(14)

      // For an error
      const asyncErrChained = errAsync('Oops').then((res) => {
        if (res.isErr()) {
          return res.error + '!'
        }
      })

      expect(asyncErrChained).toBeInstanceOf(Promise)
      const err = await asyncErrChained
      expect(err).toEqual('Oops!')
    })

    it('Can be used with Promise.all', async () => {
      const allResult = await Promise.all([okAsync<string, Error>('1')])

      expect(allResult).toHaveLength(1)
      expect(allResult[0]).toBeInstanceOf(Ok)
      if (!(allResult[0] instanceof Ok)) return
      expect(allResult[0].isOk()).toBe(true)
      expect(allResult[0]._unsafeUnwrap()).toEqual('1')
    })

    it('rejects if the underlying promise is rejected', () => {
      const asyncResult = new ResultAsync(Promise.reject('oops'))
      expect(asyncResult).rejects.toBe('oops')
    })
  })

  describe('map', () => {
    it('Maps a value using a synchronous function', async () => {
      const asyncVal = okAsync(12)

      const mapSyncFn = jest.fn((number) => number.toString())

      const mapped = asyncVal.map(mapSyncFn)

      expect(mapped).toBeInstanceOf(ResultAsync)

      const newVal = await mapped

      expect(newVal.isOk()).toBe(true)
      expect(newVal._unsafeUnwrap()).toBe('12')
      expect(mapSyncFn).toHaveBeenCalledTimes(1)
    })

    it('Maps a value using an asynchronous function', async () => {
      const asyncVal = okAsync(12)

      const mapAsyncFn = jest.fn((number) => Promise.resolve(number.toString()))

      const mapped = asyncVal.map(mapAsyncFn)

      expect(mapped).toBeInstanceOf(ResultAsync)

      const newVal = await mapped

      expect(newVal.isOk()).toBe(true)
      expect(newVal._unsafeUnwrap()).toBe('12')
      expect(mapAsyncFn).toHaveBeenCalledTimes(1)
    })

    it('Skips an error', async () => {
      const asyncErr = errAsync<number, string>('Wrong format')

      const mapSyncFn = jest.fn((number) => number.toString())

      const notMapped = asyncErr.map(mapSyncFn)

      expect(notMapped).toBeInstanceOf(ResultAsync)

      const newVal = await notMapped

      expect(newVal.isErr()).toBe(true)
      expect(newVal._unsafeUnwrapErr()).toBe('Wrong format')
      expect(mapSyncFn).toHaveBeenCalledTimes(0)
    })
  })

  describe('mapErr', () => {
    it('Maps an error using a synchronous function', async () => {
      const asyncErr = errAsync('Wrong format')

      const mapErrSyncFn = jest.fn((str) => 'Error: ' + str)

      const mappedErr = asyncErr.mapErr(mapErrSyncFn)

      expect(mappedErr).toBeInstanceOf(ResultAsync)

      const newVal = await mappedErr

      expect(newVal.isErr()).toBe(true)
      expect(newVal._unsafeUnwrapErr()).toBe('Error: Wrong format')
      expect(mapErrSyncFn).toHaveBeenCalledTimes(1)
    })

    it('Maps an error using an asynchronous function', async () => {
      const asyncErr = errAsync('Wrong format')

      const mapErrAsyncFn = jest.fn((str) => Promise.resolve('Error: ' + str))

      const mappedErr = asyncErr.mapErr(mapErrAsyncFn)

      expect(mappedErr).toBeInstanceOf(ResultAsync)

      const newVal = await mappedErr

      expect(newVal.isErr()).toBe(true)
      expect(newVal._unsafeUnwrapErr()).toBe('Error: Wrong format')
      expect(mapErrAsyncFn).toHaveBeenCalledTimes(1)
    })

    it('Skips a value', async () => {
      const asyncVal = okAsync(12)

      const mapErrSyncFn = jest.fn((str) => 'Error: ' + str)

      const notMapped = asyncVal.mapErr(mapErrSyncFn)

      expect(notMapped).toBeInstanceOf(ResultAsync)

      const newVal = await notMapped

      expect(newVal.isOk()).toBe(true)
      expect(newVal._unsafeUnwrap()).toBe(12)
      expect(mapErrSyncFn).toHaveBeenCalledTimes(0)
    })
  })

  describe('andThen', () => {
    it('Maps a value using a function returning a ResultAsync', async () => {
      const asyncVal = okAsync(12)

      const andThenResultAsyncFn = jest.fn(() => okAsync('good'))

      const mapped = asyncVal.andThen(andThenResultAsyncFn)

      expect(mapped).toBeInstanceOf(ResultAsync)

      const newVal = await mapped

      expect(newVal.isOk()).toBe(true)
      expect(newVal._unsafeUnwrap()).toBe('good')
      expect(andThenResultAsyncFn).toHaveBeenCalledTimes(1)
    })

    it('Maps a value using a function returning a Result', async () => {
      const asyncVal = okAsync(12)

      const andThenResultFn = jest.fn(() => ok('good'))

      const mapped = asyncVal.andThen(andThenResultFn)

      expect(mapped).toBeInstanceOf(ResultAsync)

      const newVal = await mapped

      expect(newVal.isOk()).toBe(true)
      expect(newVal._unsafeUnwrap()).toBe('good')
      expect(andThenResultFn).toHaveBeenCalledTimes(1)
    })

    it('Skips an Error', async () => {
      const asyncVal = errAsync<string, string>('Wrong format')

      const andThenResultFn = jest.fn(() => ok<string, string>('good'))

      const notMapped = asyncVal.andThen(andThenResultFn)

      expect(notMapped).toBeInstanceOf(ResultAsync)

      const newVal = await notMapped

      expect(newVal.isErr()).toBe(true)
      expect(newVal._unsafeUnwrapErr()).toBe('Wrong format')
      expect(andThenResultFn).toHaveBeenCalledTimes(0)
    })
  })

  describe('orElse', () => {
    it('Skips orElse on an Ok value', async () => {
      const okVal = okAsync(12)
      const errorCallback = jest.fn((_errVal) => errAsync<number, string>('It is now a string'))


      const result = await okVal.orElse(errorCallback)

      expect(result).toEqual(ok(12))

      expect(errorCallback).not.toHaveBeenCalled()
    })

    it('Invokes the orElse callback on an Err value', async () => {
      const myResult = errAsync('BOOOM!')
      const errorCallback = jest.fn((_errVal) => errAsync(true))

      const result = await myResult.orElse(errorCallback)

      expect(result).toEqual(err(true))
      expect(errorCallback).toHaveBeenCalledTimes(1)
    })

    it('Accepts a regular Result in the callback', async () => {
      const myResult = errAsync('BOOOM!')
      const errorCallback = jest.fn((_errVal) => err(true))

      const result = await myResult.orElse(errorCallback)

      expect(result).toEqual(err(true))
      expect(errorCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('andFinally', () => {
    it('Maps a value using a function returning a ResultAsync', async () => {
      const asyncVal = okAsync(1)
      const andThenResultAsyncFn = jest.fn(() => okAsync('good'))
      type ExpectedType = ResultAsync<string, never>
      const mapped: ExpectedType = asyncVal.andFinally(andThenResultAsyncFn)

      expect(mapped).toBeInstanceOf(ResultAsync)
      const newVal = await mapped
      expect(newVal.isOk()).toBe(true)
      expect(newVal._unsafeUnwrap()).toBe('good')
      expect(andThenResultAsyncFn).toHaveBeenCalledTimes(1)
    })

    it('Maps a value using a function returning a Result', async () => {
      const asyncVal = okAsync(12)

      const andThenResultFn = jest.fn(() => ok('good'))
      type ExpectedType = ResultAsync<string, never>
      const mapped: ExpectedType = asyncVal.andFinally(andThenResultFn)

      expect(mapped).toBeInstanceOf(ResultAsync)

      const newVal = await mapped

      expect(newVal.isOk()).toBe(true)
      expect(newVal._unsafeUnwrap()).toBe('good')
      expect(andThenResultFn).toHaveBeenCalledTimes(1)
    })

    it('Invokes the andFinally callback on an Err value', async () => {
      const myResult = errAsync('BOOOM!')
      const finallyCallback = jest.fn((_errVal) => errAsync(true))
      type ExpectedType = Result<never, boolean>
      const result: ExpectedType = await myResult.andFinally(finallyCallback)

      expect(result).toEqual(err(true))
      expect(finallyCallback).toHaveBeenCalledTimes(1)
    })

    it('Accepts a regular Result in the callback', async () => {
      const myResult = errAsync('BOOOM!')
      const errorCallback = jest.fn((_errVal) => err(true))
      type ExpectedType = Result<never, boolean>
      const result: ExpectedType = await myResult.andFinally(errorCallback)

      expect(result).toEqual(err(true))
      expect(errorCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('match', () => {
    it('Matches on an Ok', async () => {
      const okMapper = jest.fn((_val) => 'weeeeee')
      const errMapper = jest.fn((_val) => 'wooooo')

      const matched = await okAsync(12).match(okMapper, errMapper)

      expect(matched).toBe('weeeeee')
      expect(okMapper).toHaveBeenCalledTimes(1)
      expect(errMapper).not.toHaveBeenCalled()
    })

    it('Matches on an Error', async () => {
      const okMapper = jest.fn((_val) => 'weeeeee')
      const errMapper = jest.fn((_val) => 'wooooo')

      const matched = await errAsync('bad').match(okMapper, errMapper)

      expect(matched).toBe('wooooo')
      expect(okMapper).not.toHaveBeenCalled()
      expect(errMapper).toHaveBeenCalledTimes(1)
    })
  })

  describe('unwrapOr', () => {
    it('returns a promise to the result value on an Ok', async () => {
      const unwrapped = await okAsync(12).unwrapOr(10)
      expect(unwrapped).toBe(12)
    })

    it('returns a promise to the provided default value on an Error', async () => {
      const unwrapped = await errAsync<number, number>(12).unwrapOr(10)
      expect(unwrapped).toBe(10)
    })
  })

  describe('fromSafePromise', () => {
    it('Creates a ResultAsync from a Promise', async () => {
      const res = ResultAsync.fromSafePromise(Promise.resolve(12))

      expect(res).toBeInstanceOf(ResultAsync)

      const val = await res
      expect(val.isOk()).toBe(true)
      expect(val._unsafeUnwrap()).toEqual(12)
    })

    it('has a top level export', () => {
      expect(fromSafePromise).toBe(ResultAsync.fromSafePromise)
    })
  })

  describe('fromPromise', () => {
    it('Accepts an error handler as a second argument', async () => {
      const res = ResultAsync.fromPromise(Promise.reject('No!'), (e) => new Error('Oops: ' + e))

      expect(res).toBeInstanceOf(ResultAsync)

      const val = await res
      expect(val.isErr()).toBe(true)
      expect(val._unsafeUnwrapErr()).toEqual(Error('Oops: No!'))
    })

    it('has a top level export', () => {
      expect(fromPromise).toBe(ResultAsync.fromPromise)
    })
  })

  describe('ResultAsync.fromThrowable', () => {
    it('creates a new function that returns a ResultAsync', async () => {
      const example = ResultAsync.fromThrowable(async (a: number, b: number) => a + b)
      const res = example(4, 8)
      expect(res).toBeInstanceOf(ResultAsync)

      const val = await res
      expect(val.isOk()).toBe(true)
      expect(val._unsafeUnwrap()).toEqual(12)
    })

    it('handles synchronous errors', async () => {
      const example = ResultAsync.fromThrowable(() => {
        if (1 > 0) throw new Error('Oops: No!')

        return Promise.resolve(12)
      })

      const val = await example()
      expect(val.isErr()).toBe(true)

      expect(val._unsafeUnwrapErr()).toEqual(Error('Oops: No!'))
    })

    it('handles asynchronous errors', async () => {
      const example = ResultAsync.fromThrowable(async () => {
        if (1 > 0) throw new Error('Oops: No!')

        return 12
      })
      
      const val = await example()
      expect(val.isErr()).toBe(true)

      expect(val._unsafeUnwrapErr()).toEqual(Error('Oops: No!'))
    })

    it('Accepts an error handler as a second argument', async () => {
      const example = ResultAsync.fromThrowable(
        () => Promise.reject('No!'),
        (e) => new Error('Oops: ' + e)
      )
      
      const val = await example()
      expect(val.isErr()).toBe(true)

      expect(val._unsafeUnwrapErr()).toEqual(TypeError('Oops: No!'))
    })

    it('has a top level export', () => {
      expect(fromAsyncThrowable).toBe(ResultAsync.fromThrowable)
    })
  })

  describe('okAsync', () => {
    it('Creates a ResultAsync that resolves to an Ok', async () => {
      const val = okAsync(12)

      expect(val).toBeInstanceOf(ResultAsync)

      const res = await val

      expect(res.isOk()).toBe(true)
      expect(res._unsafeUnwrap()).toEqual(12)
    })
  })

  describe('errAsync', () => {
    it('Creates a ResultAsync that resolves to an Err', async () => {
      const err = errAsync('bad')

      expect(err).toBeInstanceOf(ResultAsync)

      const res = await err

      expect(res.isErr()).toBe(true)
      expect(res._unsafeUnwrapErr()).toEqual('bad')
    })
  })
})
