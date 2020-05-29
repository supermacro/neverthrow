import { ok, err, Ok, Err, Result, ResultAsync, okAsync, errAsync } from '../src'
import { chain, chain3, chain4, chain5, chain6, chain7, chain8 } from '../src/chain'

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

  it('Maps over an Ok value', () => {
    const okVal = ok(12)
    const mapFn = jest.fn(number => number.toString())

    const mapped = okVal.map(mapFn)

    expect(mapped.isOk()).toBe(true)
    expect(mapped._unsafeUnwrap()).toBe('12')
    expect(mapFn).toHaveBeenCalledTimes(1)
  })

  it('Skips `mapErr`', () => {
    const mapErrorFunc = jest.fn(_error => 'mapped error value')

    const notMapped = ok(12).mapErr(mapErrorFunc)

    expect(notMapped.isOk()).toBe(true)
    expect(mapErrorFunc).not.toHaveBeenCalledTimes(1)
  })

  describe('andThen', () => {
    it('Maps to an Ok', () => {
      const okVal = ok(12)

      const flattened = okVal.andThen(_number => {
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

      const flattened = okval.andThen(_number => {
        // ...
        // complex logic
        // ...
        return err('Whoopsies!')
      })

      expect(flattened.isOk()).toBe(false)

      const nextFn = jest.fn(_val => ok('noop'))

      flattened.andThen(nextFn)

      expect(nextFn).not.toHaveBeenCalled()
    })

    it('Maps to a ResultAsync', async () => {
      const okVal = ok(12)

      const flattened = okVal.andThen(_number => {
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
  })

  it('Maps to a promise', async () => {
    const asyncMapper = jest.fn(_val => {
      // ...
      // complex logic
      // ..

      // db queries
      // network calls
      // disk io
      // etc ...
      return Promise.resolve(ok('Very Nice!'))
    })

    const okVal = ok(12)

    const promise = okVal.asyncMap(asyncMapper)

    expect(promise).toBeInstanceOf(ResultAsync)

    const newResult = await promise

    expect(newResult.isOk()).toBe(true)
    expect(asyncMapper).toHaveBeenCalledTimes(1)
  })

  it('Matches on an Ok', () => {
    const okMapper = jest.fn(_val => 'weeeeee')
    const errMapper = jest.fn(_val => 'wooooo')

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

  describe('or', () => {
    it('Specified value wins default', () => {
      const result = ok(12).or(42)

      expect(result).toBe(12)
    })

    it('NULL is a valid value', () => {
      const result = ok<number | null, Error>(null).or(42)

      expect(result).toBe(null)
    })

    it('undefined is not a valid value', () => {
      const result = ok<number | undefined, Error>(undefined).or(42)

      expect(result).toBe(42)
    })
  })

  describe('orGet', () => {
    it('Specified value wins default', () => {
      const result = ok(12).orGet(() => 42)

      expect(result).toBe(12)
    })

    it('NULL is a valid value', () => {
      const result = ok<number | null, Error>(null).orGet(() => 42)

      expect(result).toBe(null)
    })

    it('undefined is not a valid value', () => {
      const result = ok<number | undefined, Error>(undefined).orGet(() => 42)

      expect(result).toBe(42)
    })
  })

  describe('orError', () => {
    it('On success do nothing', () => {
      const result = ok(12).orError()

      expect(result).toBe(12)
    })
  })
})

describe('Result.Err', () => {
  it('Creates an Err value', () => {
    const errVal = err('I have you now.')

    expect(errVal.isOk()).toBe(false)
    expect(errVal.isErr()).toBe(true)
    expect(errVal).toBeInstanceOf(Err)
  })

  it('Skips `map`', () => {
    const errVal = err('I am your father')

    const mapper = jest.fn(_value => 'noooo')

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

  it('Skips over andThen', () => {
    const errVal = err('Yolo')

    const mapper = jest.fn(_val => ok<string, string>('yooyo'))

    const hopefullyNotFlattened = errVal.andThen(mapper)

    expect(hopefullyNotFlattened.isErr()).toBe(true)
    expect(mapper).not.toHaveBeenCalled()
    expect(errVal._unsafeUnwrapErr()).toEqual('Yolo')
  })

  it('Skips over andThen given a ResultAsync function', () => {
    const errVal = err('Yolo')

    const asyncMapper = jest.fn(_val => okAsync<string, string>('yooyo'))

    const hopefullyNotFlattened = errVal.andThen(asyncMapper)

    expect(hopefullyNotFlattened.isErr()).toBe(true)
    expect(asyncMapper).not.toHaveBeenCalled()
    expect(errVal._unsafeUnwrapErr()).toEqual('Yolo')
  })

  it('Does not invoke callback within `asyncMap`', async () => {
    const asyncMapper = jest.fn(_val => {
      // ...
      // complex logic
      // ..

      // db queries
      // network calls
      // disk io
      // etc ...
      return Promise.resolve(ok('Very Nice!'))
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
    const okMapper = jest.fn(_val => 'weeeeee')
    const errMapper = jest.fn(_val => 'wooooo')

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

  describe('or', () => {
    it('Use default value on any err()', () => {
      const result = err(new Error()).or(42)

      expect(result).toBe(42)
    })
  })

  describe('orGet', () => {
    it('Use supplied result on any err()', () => {
      const result = err(new Error()).orGet(() => 42)

      expect(result).toBe(42)
    })
  })

  describe('orError', () => {
    it("Throws result's error type", () => {
      function throwsError () {
        err(new Error('popa')).orError()
      }

      expect(throwsError).toThrowError(new Error('popa'))
    })

    it('Creates an error and throws it', () => {
      function throwsError() {
        err('popa').orError((er) => new Error(er))
      }

      expect(throwsError).toThrowError(new Error('popa'))
    })

    it("Cast to string the error object", () => {
      function throwsError() {
        err('popa').orError()
      }

      expect(throwsError).toThrowError(new Error('popa'))
    })
  })
})

describe('Async Chaining API 🔗', () => {
  describe('Chaining two async computations', () => {
    it('Should sequentially chain both computations when the first succeeds', async () => {
      const computation1 = Promise.resolve(ok(123))

      const computation2 = jest.fn(
        (value: number): Promise<Result<string, never>> => {
          return Promise.resolve(ok(`Number is: ${value}`))
        },
      )

      const result = await chain(computation1, computation2)

      expect(result.isOk()).toBe(true)
      expect(result._unsafeUnwrap()).toBe(`Number is: 123`)

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith(123)
    })

    it('Should short circuit when the first computation fails', async () => {
      const computation1 = Promise.resolve(err('KABOOM!'))

      const computation2 = jest.fn(
        (value: number): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Number is: ${value}`))
        },
      )

      const result = await chain(computation1, computation2)

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBe('KABOOM!')
      expect(computation2).not.toHaveBeenCalled()
    })
  })

  describe('Chaining three async computations', () => {
    it('Should sequentially chain all three computations when the first two succeed', async () => {
      const computation1 = Promise.resolve(ok(123))

      const computation2 = jest.fn(
        (value: number): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Number is: ${value}`))
        },
      )

      const computation3 = jest.fn(
        (value: string): Promise<Result<boolean, string>> => {
          return Promise.resolve(ok(value.length > 10))
        },
      )

      const result = await chain3(computation1, computation2, computation3)

      expect(result.isOk()).toBe(true)
      expect(result._unsafeUnwrap()).toBe('Number is: 123'.length > 10)

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith(123)

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith('Number is: 123')
    })

    it('Should short circuit when the first computation fails', async () => {
      const computation1 = Promise.resolve(err('KAPOW!'))

      const computation2 = jest.fn(
        (value: number): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Number is: ${value}`))
        },
      )

      const computation3 = jest.fn(
        (value: string): Promise<Result<boolean, string>> => {
          return Promise.resolve(ok(value.length > 10))
        },
      )

      const result = await chain3(computation1, computation2, computation3)

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBe('KAPOW!')
      expect(computation2).not.toHaveBeenCalled()
      expect(computation3).not.toHaveBeenCalled()
    })

    it('Should short circuit when the second computation fails', async () => {
      const computation1 = Promise.resolve(ok('yeeeyyy :)'))

      const computation2 = jest.fn(
        (_: string): Promise<Result<string, string>> => {
          return Promise.resolve(err('KABOUUUSHSHSHSH!'))
        },
      )

      const computation3 = jest.fn(
        (value: string): Promise<Result<boolean, string>> => {
          return Promise.resolve(ok(value.length > 10))
        },
      )

      const result = await chain3(computation1, computation2, computation3)

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBe('KABOUUUSHSHSHSH!')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith('yeeeyyy :)')

      expect(computation3).not.toHaveBeenCalled()
    })
  })

  describe('Chaining four async computations', () => {
    it('Should sequentially chain all four computations when the first three succeed', async () => {
      const computation1 = Promise.resolve(ok(123))

      const computation2 = jest.fn(
        (value: number): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Number is: ${value}`))
        },
      )

      const computation3 = jest.fn(
        (value: string): Promise<Result<boolean, string>> => {
          return Promise.resolve(ok(value.length > 10))
        },
      )

      const computation4 = jest.fn(
        (value: boolean): Promise<Result<number, string>> => {
          return Promise.resolve(ok(Number(value) + 20))
        },
      )

      const result = await chain4(computation1, computation2, computation3, computation4)

      const expectedValue = Number('Number is: 123'.length > 10) + 20

      expect(result.isOk()).toBe(true)
      expect(result._unsafeUnwrap()).toBe(expectedValue)

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith(123)

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith('Number is: 123')

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('Number is: 123'.length > 10)
    })

    it('Should short circuit when the first computation fails', async () => {
      const computation1 = Promise.resolve(err('ERROR: 911!'))

      const computation2 = jest.fn(
        (value: number): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Number is: ${value}`))
        },
      )

      const computation3 = jest.fn(
        (value: string): Promise<Result<boolean, string>> => {
          return Promise.resolve(ok(value.length > 10))
        },
      )

      const computation4 = jest.fn(
        (value: boolean): Promise<Result<number, string>> => {
          return Promise.resolve(ok(Number(value) + 20))
        },
      )

      const result = await chain4(computation1, computation2, computation3, computation4)

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBe('ERROR: 911!')
      expect(computation2).not.toHaveBeenCalled()
      expect(computation3).not.toHaveBeenCalled()
      expect(computation4).not.toHaveBeenCalled()
    })

    it('Should short circuit when the second computation fails', async () => {
      const computation1 = Promise.resolve(ok({ age: 12 }))

      const computation2 = jest.fn(
        (_: { age: number }): Promise<Result<string, string>> => {
          return Promise.resolve(err('Boooooom!'))
        },
      )

      const computation3 = jest.fn(
        (value: string): Promise<Result<boolean, string>> => {
          return Promise.resolve(ok(value.length > 10))
        },
      )

      const computation4 = jest.fn(
        (value: boolean): Promise<Result<number, string>> => {
          return Promise.resolve(ok(Number(value) + 20))
        },
      )

      const result = await chain4(computation1, computation2, computation3, computation4)

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBe('Boooooom!')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ age: 12 })

      expect(computation3).not.toHaveBeenCalled()
      expect(computation4).not.toHaveBeenCalled()
    })

    it('Should short circuit when the third computation fails', async () => {
      const computation1 = Promise.resolve(ok({ age: 12 }))

      const computation2 = jest.fn(
        (value: { age: number }): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Age is: ${value.age}`))
        },
      )

      const computation3 = jest.fn(
        (_: string): Promise<Result<boolean, number>> => {
          return Promise.resolve(err(500))
        },
      )

      const computation4 = jest.fn(
        (value: boolean): Promise<Result<number, string>> => {
          return Promise.resolve(ok(Number(value) + 20))
        },
      )

      const result = await chain4(computation1, computation2, computation3, computation4)

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBe(500)

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ age: 12 })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith('Age is: 12')

      expect(computation4).not.toHaveBeenCalled()
    })
  })

  describe('Chaining five async computations', () => {
    it('Should sequentially chain all five computations when the first four succeed', async () => {
      const computation1 = Promise.resolve(ok([1, 2, 3, 4, 5]))

      const computation2 = jest.fn(
        (value: number[]): Promise<Result<number, string>> => {
          const sum = value.reduce((a, e) => a + e, 0)
          return Promise.resolve(ok(sum))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, string>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, string>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const result = await chain5(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
      )

      expect(result.isOk()).toBe(true)
      expect(result._unsafeUnwrap()).toBe('true')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith([1, 2, 3, 4, 5])

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(15)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('Sum is: 15')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)
    })

    it('Should short circuit when the first computation fails', async () => {
      const computation1 = Promise.resolve(err(new Error('Death Star Blew Up')))

      const computation2 = jest.fn(
        (value: number[]): Promise<Result<number, Error>> => {
          const sum = value.reduce((a, e) => a + e, 0)
          return Promise.resolve(ok(sum))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const result = await chain5(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('Death Star Blew Up')

      expect(computation2).not.toHaveBeenCalled()
      expect(computation3).not.toHaveBeenCalled()
      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
    })

    it('Should short circuit when the second computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        (_: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(err(new Error('I am allergic to cats')))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const result = await chain5(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('I am allergic to cats')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).not.toHaveBeenCalled()
      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
    })

    it('Should short circuit when the third computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (_: number): Promise<Result<string, Error>> => {
          return Promise.resolve(err(new Error('NOOOOOOO')))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const result = await chain5(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('NOOOOOOO')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
    })

    it('Should short circuit when the fourth computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (numberOfCats: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`There are ${numberOfCats} cats`))
        },
      )

      const computation4 = jest.fn(
        (_: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(err(new Error('So many cats!!!!')))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const result = await chain5(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('So many cats!!!!')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('There are 2 cats')

      expect(computation5).not.toHaveBeenCalled()
    })
  })

  describe('Chaining six async computations', () => {
    it('Should sequentially chain all six computations when the first five succeed', async () => {
      const computation1 = Promise.resolve(ok([1, 2, 3, 4, 5]))

      const computation2 = jest.fn(
        (value: number[]): Promise<Result<number, string>> => {
          const sum = value.reduce((a, e) => a + e, 0)
          return Promise.resolve(ok(sum))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, string>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, string>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], string>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const result = await chain6(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
      )

      expect(result.isOk()).toBe(true)
      expect(result._unsafeUnwrap()).toEqual(['t', 'r', 'u', 'e'])

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith([1, 2, 3, 4, 5])

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(15)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('Sum is: 15')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation6).toHaveBeenCalledTimes(1)
      expect(computation6).toHaveBeenCalledWith('true')
    })

    it('Should short circuit when the first computation fails', async () => {
      const computation1 = Promise.resolve(err(new Error('Death Star Blew Up')))

      const computation2 = jest.fn(
        (value: number[]): Promise<Result<number, Error>> => {
          const sum = value.reduce((a, e) => a + e, 0)
          return Promise.resolve(ok(sum))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const result = await chain6(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('Death Star Blew Up')

      expect(computation2).not.toHaveBeenCalled()
      expect(computation3).not.toHaveBeenCalled()
      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
    })

    it('Should short circuit when the second computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        (_: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(err(new Error('I am allergic to cats')))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const result = await chain6(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('I am allergic to cats')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).not.toHaveBeenCalled()
      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
    })

    it('Should short circuit when the third computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (_: number): Promise<Result<string, Error>> => {
          return Promise.resolve(err(new Error('NOOOOOOO')))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const result = await chain6(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('NOOOOOOO')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
    })

    it('Should short circuit when the fourth computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (numberOfCats: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`There are ${numberOfCats} cats`))
        },
      )

      const computation4 = jest.fn(
        (_: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(err(new Error('So many cats!!!!')))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const result = await chain6(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('So many cats!!!!')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('There are 2 cats')

      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
    })

    it('Should short circuit when the fifth computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (numberOfCats: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`There are ${numberOfCats} cats`))
        },
      )

      const computation4 = jest.fn(
        (description: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(description.length > 1))
        },
      )

      const computation5 = jest.fn(
        (_: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(err(new Error('sadface')))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const result = await chain6(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('sadface')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('There are 2 cats')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation6).not.toHaveBeenCalled()
    })
  })

  describe('Chaining seven async computations', () => {
    it('Should sequentially chain all seven computations when the first six succeed', async () => {
      const computation1 = Promise.resolve(ok([1, 2, 3, 4, 5]))

      const computation2 = jest.fn(
        (value: number[]): Promise<Result<number, string>> => {
          const sum = value.reduce((a, e) => a + e, 0)
          return Promise.resolve(ok(sum))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, string>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, string>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], string>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], string>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const result = await chain7(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
      )

      expect(result.isOk()).toBe(true)
      expect(result._unsafeUnwrap()).toEqual(['t', 'r', 'u', 'e'].reverse())

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith([1, 2, 3, 4, 5])

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(15)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('Sum is: 15')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation6).toHaveBeenCalledTimes(1)
      expect(computation6).toHaveBeenCalledWith('true')

      expect(computation7).toHaveBeenCalledTimes(1)
      expect(computation7).toHaveBeenCalledWith(['t', 'r', 'u', 'e'])
    })

    it('Should short circuit when the first computation fails', async () => {
      const computation1 = Promise.resolve(err(new Error('Death Star Blew Up')))

      const computation2 = jest.fn(
        (value: number[]): Promise<Result<number, Error>> => {
          const sum = value.reduce((a, e) => a + e, 0)
          return Promise.resolve(ok(sum))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const result = await chain7(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('Death Star Blew Up')

      expect(computation2).not.toHaveBeenCalled()
      expect(computation3).not.toHaveBeenCalled()
      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
      expect(computation7).not.toHaveBeenCalled()
    })

    it('Should short circuit when the second computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        (_: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(err(new Error('I am allergic to cats')))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const result = await chain7(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('I am allergic to cats')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).not.toHaveBeenCalled()
      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
      expect(computation7).not.toHaveBeenCalled()
    })

    it('Should short circuit when the third computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (_: number): Promise<Result<string, Error>> => {
          return Promise.resolve(err(new Error('NOOOOOOO')))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const result = await chain7(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('NOOOOOOO')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
      expect(computation7).not.toHaveBeenCalled()
    })

    it('Should short circuit when the fourth computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (numberOfCats: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`There are ${numberOfCats} cats`))
        },
      )

      const computation4 = jest.fn(
        (_: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(err(new Error('So many cats!!!!')))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const result = await chain7(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('So many cats!!!!')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('There are 2 cats')

      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
      expect(computation7).not.toHaveBeenCalled()
    })

    it('Should short circuit when the fifth computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (numberOfCats: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`There are ${numberOfCats} cats`))
        },
      )

      const computation4 = jest.fn(
        (description: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(description.length > 1))
        },
      )

      const computation5 = jest.fn(
        (_: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(err(new Error('sadface')))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const result = await chain7(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('sadface')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('There are 2 cats')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation6).not.toHaveBeenCalled()
      expect(computation7).not.toHaveBeenCalled()
    })

    it('Should short circuit when the sixth computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (numberOfCats: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`There are ${numberOfCats} cats`))
        },
      )

      const computation4 = jest.fn(
        (description: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(description.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (_: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(err(new Error('Strings scare me')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const result = await chain7(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('Strings scare me')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('There are 2 cats')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation6).toHaveBeenCalledTimes(1)
      expect(computation6).toHaveBeenCalledWith('true')

      expect(computation7).not.toHaveBeenCalled()
    })
  })

  describe('Chaining eight async computations', () => {
    it('Should sequentially chain all eight computations when the first seven succeed', async () => {
      const computation1 = Promise.resolve(ok([1, 2, 3, 4, 5]))

      const computation2 = jest.fn(
        (value: number[]): Promise<Result<number, string>> => {
          const sum = value.reduce((a, e) => a + e, 0)
          return Promise.resolve(ok(sum))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, string>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, string>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], string>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], string>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const computation8 = jest.fn(
        (value: string[]): Promise<Result<() => string[], string>> => {
          return Promise.resolve(ok(() => value))
        },
      )

      const result = await chain8(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
        computation8,
      )

      expect(result.isOk()).toBe(true)
      expect(result._unsafeUnwrap()).toBeInstanceOf(Function)
      expect(result._unsafeUnwrap()()).toEqual(['t', 'r', 'u', 'e'].reverse())

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith([1, 2, 3, 4, 5])

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(15)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('Sum is: 15')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation6).toHaveBeenCalledTimes(1)
      expect(computation6).toHaveBeenCalledWith('true')

      expect(computation7).toHaveBeenCalledTimes(1)
      expect(computation7).toHaveBeenCalledWith(['t', 'r', 'u', 'e'])

      expect(computation8).toHaveBeenCalledTimes(1)
      expect(computation8).toHaveBeenCalledWith(['t', 'r', 'u', 'e'].reverse())
    })

    it('Should short circuit when the first computation fails', async () => {
      const computation1 = Promise.resolve(err(new Error('Death Star Blew Up')))

      const computation2 = jest.fn(
        (value: number[]): Promise<Result<number, Error>> => {
          const sum = value.reduce((a, e) => a + e, 0)
          return Promise.resolve(ok(sum))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const computation8 = jest.fn(
        (value: string[]): Promise<Result<() => string[], Error>> => {
          return Promise.resolve(ok(() => value))
        },
      )

      const result = await chain8(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
        computation8,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('Death Star Blew Up')

      expect(computation2).not.toHaveBeenCalled()
      expect(computation3).not.toHaveBeenCalled()
      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
      expect(computation7).not.toHaveBeenCalled()
      expect(computation8).not.toHaveBeenCalled()
    })

    it('Should short circuit when the second computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        (_: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(err(new Error('I am allergic to cats')))
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const computation8 = jest.fn(
        (value: string[]): Promise<Result<() => string[], Error>> => {
          return Promise.resolve(ok(() => value))
        },
      )

      const result = await chain8(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
        computation8,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('I am allergic to cats')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).not.toHaveBeenCalled()
      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
      expect(computation7).not.toHaveBeenCalled()
      expect(computation8).not.toHaveBeenCalled()
    })

    it('Should short circuit when the third computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (_: number): Promise<Result<string, Error>> => {
          return Promise.resolve(err(new Error('NOOOOOOO')))
        },
      )

      const computation4 = jest.fn(
        (value: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(value.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const computation8 = jest.fn(
        (value: string[]): Promise<Result<() => string[], Error>> => {
          return Promise.resolve(ok(() => value))
        },
      )

      const result = await chain8(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
        computation8,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('NOOOOOOO')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).not.toHaveBeenCalled()
      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
      expect(computation7).not.toHaveBeenCalled()
      expect(computation8).not.toHaveBeenCalled()
    })

    it('Should short circuit when the fourth computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (numberOfCats: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`There are ${numberOfCats} cats`))
        },
      )

      const computation4 = jest.fn(
        (_: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(err(new Error('So many cats!!!!')))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const computation8 = jest.fn(
        (value: string[]): Promise<Result<() => string[], Error>> => {
          return Promise.resolve(ok(() => value))
        },
      )

      const result = await chain8(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
        computation8,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('So many cats!!!!')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('There are 2 cats')

      expect(computation5).not.toHaveBeenCalled()
      expect(computation6).not.toHaveBeenCalled()
      expect(computation7).not.toHaveBeenCalled()
      expect(computation8).not.toHaveBeenCalled()
    })

    it('Should short circuit when the fifth computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (numberOfCats: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`There are ${numberOfCats} cats`))
        },
      )

      const computation4 = jest.fn(
        (description: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(description.length > 1))
        },
      )

      const computation5 = jest.fn(
        (_: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(err(new Error('sadface')))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const computation8 = jest.fn(
        (value: string[]): Promise<Result<() => string[], Error>> => {
          return Promise.resolve(ok(() => value))
        },
      )

      const result = await chain8(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
        computation8,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('sadface')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('There are 2 cats')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation6).not.toHaveBeenCalled()
      expect(computation7).not.toHaveBeenCalled()
      expect(computation8).not.toHaveBeenCalled()
    })

    it('Should short circuit when the sixth computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (numberOfCats: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`There are ${numberOfCats} cats`))
        },
      )

      const computation4 = jest.fn(
        (description: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(description.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (_: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(err(new Error('Strings scare me')))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const computation8 = jest.fn(
        (value: string[]): Promise<Result<() => string[], Error>> => {
          return Promise.resolve(ok(() => value))
        },
      )

      const result = await chain8(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
        computation8,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('Strings scare me')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('There are 2 cats')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation6).toHaveBeenCalledTimes(1)
      expect(computation6).toHaveBeenCalledWith('true')

      expect(computation7).not.toHaveBeenCalled()
      expect(computation8).not.toHaveBeenCalled()
    })

    it('Should short circuit when the seventh computation fails', async () => {
      interface CatCount {
        cats: string[]
      }

      const computation1 = Promise.resolve(
        ok<CatCount, Error>({ cats: ['Garfield', 'Felix'] }),
      )

      const computation2 = jest.fn(
        ({ cats }: CatCount): Promise<Result<number, Error>> => {
          return Promise.resolve(ok(cats.length))
        },
      )

      const computation3 = jest.fn(
        (numberOfCats: number): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(`There are ${numberOfCats} cats`))
        },
      )

      const computation4 = jest.fn(
        (description: string): Promise<Result<boolean, Error>> => {
          return Promise.resolve(ok(description.length > 1))
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, Error>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Promise<Result<string[], Error>> => {
          return Promise.resolve(ok(value.split('')))
        },
      )

      const computation7 = jest.fn(
        (_: string[]): Promise<Result<string[], Error>> => {
          return Promise.resolve(err(new Error('So closeeee!')))
        },
      )

      const computation8 = jest.fn(
        (value: string[]): Promise<Result<() => string[], Error>> => {
          return Promise.resolve(ok(() => value))
        },
      )

      const result = await chain8(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
        computation8,
      )

      expect(result.isErr()).toBe(true)
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error)
      expect(result._unsafeUnwrapErr().message).toBe('So closeeee!')

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith({ cats: ['Garfield', 'Felix'] })

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(2)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('There are 2 cats')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation6).toHaveBeenCalledTimes(1)
      expect(computation6).toHaveBeenCalledWith('true')

      expect(computation7).toHaveBeenCalledTimes(1)
      expect(computation7).toHaveBeenLastCalledWith(['t', 'r', 'u', 'e'])

      expect(computation8).not.toHaveBeenCalled()
    })
  })

  describe('Mixing sync and async computations', () => {
    it('Should work the same even when some computations are not async', async () => {
      const computation1 = Promise.resolve(ok([1, 2, 3, 4, 5]))

      const computation2 = jest.fn(
        (value: number[]): Result<number, string> => {
          const sum = value.reduce((a, e) => a + e, 0)
          return ok(sum)
        },
      )

      const computation3 = jest.fn(
        (value: number): Promise<Result<string, string>> => {
          return Promise.resolve(ok(`Sum is: ${value}`))
        },
      )

      const computation4 = jest.fn(
        (value: string): Result<boolean, string> => {
          return ok(value.length > 1)
        },
      )

      const computation5 = jest.fn(
        (value: boolean): Promise<Result<string, string>> => {
          return Promise.resolve(ok(value ? 'true' : 'false'))
        },
      )

      const computation6 = jest.fn(
        (value: string): Result<string[], string> => {
          return ok(value.split(''))
        },
      )

      const computation7 = jest.fn(
        (value: string[]): Promise<Result<string[], string>> => {
          return Promise.resolve(ok([...value].reverse()))
        },
      )

      const computation8 = jest.fn(
        (value: string[]): Promise<Result<() => string[], string>> => {
          return Promise.resolve(ok(() => value))
        },
      )

      const result = await chain8(
        computation1,
        computation2,
        computation3,
        computation4,
        computation5,
        computation6,
        computation7,
        computation8,
      )

      expect(result.isOk()).toBe(true)
      expect(result._unsafeUnwrap()).toBeInstanceOf(Function)
      expect(result._unsafeUnwrap()()).toEqual(['t', 'r', 'u', 'e'].reverse())

      expect(computation2).toHaveBeenCalledTimes(1)
      expect(computation2).toHaveBeenCalledWith([1, 2, 3, 4, 5])

      expect(computation3).toHaveBeenCalledTimes(1)
      expect(computation3).toHaveBeenCalledWith(15)

      expect(computation4).toHaveBeenCalledTimes(1)
      expect(computation4).toHaveBeenCalledWith('Sum is: 15')

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation5).toHaveBeenCalledTimes(1)
      expect(computation5).toHaveBeenCalledWith(true)

      expect(computation6).toHaveBeenCalledTimes(1)
      expect(computation6).toHaveBeenCalledWith('true')

      expect(computation7).toHaveBeenCalledTimes(1)
      expect(computation7).toHaveBeenCalledWith(['t', 'r', 'u', 'e'])

      expect(computation8).toHaveBeenCalledTimes(1)
      expect(computation8).toHaveBeenCalledWith(['t', 'r', 'u', 'e'].reverse())
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

  it('Is chainable like any Promise', async () => {
    // For a success value
    const asyncValChained = okAsync(12).then(res => {
      if (res.isOk()) {
        return res.value + 2
      }
    })

    expect(asyncValChained).toBeInstanceOf(Promise)
    const val = await asyncValChained
    expect(val).toEqual(14)

    // For an error
    const asyncErrChained = errAsync('Oops').then(res => {
      if (res.isErr()) {
        return res.error + '!'
      }
    })

    expect(asyncErrChained).toBeInstanceOf(Promise)
    const err = await asyncErrChained
    expect(err).toEqual('Oops!')
  })

  describe('map', () => {
    it('Maps a value using a synchronous function', async () => {
      const asyncVal = okAsync(12)

      const mapSyncFn = jest.fn(number => number.toString())

      const mapped = asyncVal.map(mapSyncFn)

      expect(mapped).toBeInstanceOf(ResultAsync)

      const newVal = await mapped

      expect(newVal.isOk()).toBe(true)
      expect(newVal._unsafeUnwrap()).toBe('12')
      expect(mapSyncFn).toHaveBeenCalledTimes(1)
    })

    it('Maps a value using an asynchronous function', async () => {
      const asyncVal = okAsync(12)

      const mapAsyncFn = jest.fn(number => Promise.resolve(number.toString()))

      const mapped = asyncVal.map(mapAsyncFn)

      expect(mapped).toBeInstanceOf(ResultAsync)

      const newVal = await mapped

      expect(newVal.isOk()).toBe(true)
      expect(newVal._unsafeUnwrap()).toBe('12')
      expect(mapAsyncFn).toHaveBeenCalledTimes(1)
    })

    it('Skips an error', async () => {
      const asyncErr = errAsync<number, string>('Wrong format')

      const mapSyncFn = jest.fn(number => number.toString())

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

      const mapErrSyncFn = jest.fn(str => 'Error: ' + str)

      const mappedErr = asyncErr.mapErr(mapErrSyncFn)

      expect(mappedErr).toBeInstanceOf(ResultAsync)

      const newVal = await mappedErr

      expect(newVal.isErr()).toBe(true)
      expect(newVal._unsafeUnwrapErr()).toBe('Error: Wrong format')
      expect(mapErrSyncFn).toHaveBeenCalledTimes(1)
    })

    it('Maps an error using an asynchronous function', async () => {
      const asyncErr = errAsync('Wrong format')

      const mapErrAsyncFn = jest.fn(str => Promise.resolve('Error: ' + str))

      const mappedErr = asyncErr.mapErr(mapErrAsyncFn)

      expect(mappedErr).toBeInstanceOf(ResultAsync)

      const newVal = await mappedErr

      expect(newVal.isErr()).toBe(true)
      expect(newVal._unsafeUnwrapErr()).toBe('Error: Wrong format')
      expect(mapErrAsyncFn).toHaveBeenCalledTimes(1)
    })

    it('Skips a value', async () => {
      const asyncVal = okAsync(12)

      const mapErrSyncFn = jest.fn(str => 'Error: ' + str)

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

  describe('match', () => {
    it('Matches on an Ok', async () => {
      const okMapper = jest.fn(_val => 'weeeeee')
      const errMapper = jest.fn(_val => 'wooooo')

      const matched = await okAsync(12).match(okMapper, errMapper)

      expect(matched).toBe('weeeeee')
      expect(okMapper).toHaveBeenCalledTimes(1)
      expect(errMapper).not.toHaveBeenCalled()
    })

    it('Matches on an Error', async () => {
      const okMapper = jest.fn(_val => 'weeeeee')
      const errMapper = jest.fn(_val => 'wooooo')

      const matched = await errAsync('bad').match(okMapper, errMapper)

      expect(matched).toBe('wooooo')
      expect(okMapper).not.toHaveBeenCalled()
      expect(errMapper).toHaveBeenCalledTimes(1)
    })
  })

  describe('fromPromise', () => {
    it('Creates a ResultAsync from a Promise', async () => {
      const res = ResultAsync.fromPromise(Promise.resolve(12))

      expect(res).toBeInstanceOf(ResultAsync)

      const val = await res
      expect(val.isOk()).toBe(true)
      expect(val._unsafeUnwrap()).toEqual(12)
    })

    it('Accepts an error handler as a second argument', async () => {
      const res = ResultAsync.fromPromise(Promise.reject('No!'), e => new Error('Oops: ' + e))

      expect(res).toBeInstanceOf(ResultAsync)

      const val = await res
      expect(val.isErr()).toBe(true)
      expect(val._unsafeUnwrapErr()).toEqual(Error('Oops: No!'))
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
