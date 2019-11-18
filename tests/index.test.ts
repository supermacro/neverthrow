import { ok, err, Ok, Err, Result } from '../src'

describe('Result.Ok', () => {
  it('Creates an Ok value', () => {
    
    const okVal = ok(12)
    
    expect(okVal.isOk()).toBe(true)
    expect(okVal.isErr()).toBe(false)
    expect(okVal).toBeInstanceOf(Ok)
  })

  it('Creates an ok value with null', () => {
    const okVal = ok(null)

    expect(okVal.isOk()).toBe(true)
    expect(okVal.isErr()).toBe(false)
    expect(okVal._unsafeUnwrap()).toBe(null)
  })

  it('Creates an ok value with undefined', () => {
    const okVal = ok(undefined)

    expect(okVal.isOk()).toBe(true)
    expect(okVal.isErr()).toBe(false)
    expect(okVal._unsafeUnwrap()).toBeUndefined()
  })

  it('Maps over an Ok', () => {
    const okVal = ok(12)
    const mapFn = jest.fn(number => number.toString())

    const mapped = okVal.map(mapFn)

    expect(mapped.isOk()).toBe(true)
    expect(mapped._unsafeUnwrap()).toBe('12')
    expect(mapFn).toHaveBeenCalledTimes(1)
  })

  it('Skips `mapErr`', () => {
    const mapErrorFunc = jest.fn((_error) => 'mapped error value')

    const notMapped = ok(12).mapErr(
      mapErrorFunc
    )

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


  it('Maps to a promise', async () => {
    const asyncMapper = jest.fn((_val) => {
      // ...
      // complex logic
      // ..

      // db queries
      // network calls
      // disk io
      // etc ...
      return Promise.resolve(
        ok('Very Nice!')
      )
    })

    const okVal = ok(12)

    const promise = okVal.asyncMap(asyncMapper)

    expect(promise).toBeInstanceOf(Promise)

    const newResult = await promise

    expect(newResult.isOk()).toBe(true)
    expect(asyncMapper).toHaveBeenCalledTimes(1)
  })

  it('Matches on an Ok', () => {
    const okMapper = jest.fn((_val) => 'weeeeee')
    const errMapper = jest.fn((_val) => 'wooooo')

    const matched = ok(12).match(
      okMapper,
      errMapper
    )

    expect(matched).toBe('weeeeee')
    expect(okMapper).toHaveBeenCalledTimes(1)
    expect(errMapper).not.toHaveBeenCalled()
  })

  it('Unwraps without issue', () => {
    const okVal = ok(12)

    expect(okVal._unsafeUnwrap()).toBe(12)
  })

  it('Can read the value after narrowing', () => {
    const fallible: () => Result<string, number> = () => ok('safe to read');
    const val = fallible();

    // After this check we val is narrowed to Ok<string, number>. Without this
    // line TypeScript will not allow accessing val.value.
    if (val.isErr()) return;

    expect(val.value).toBe('safe to read');
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

    const mapper = jest.fn((_value) => 'noooo')

    const hopefullyNotMapped = errVal.map(mapper)

    expect(hopefullyNotMapped.isErr()).toBe(true)
    expect(mapper).not.toHaveBeenCalled()
    expect(hopefullyNotMapped._unsafeUnwrapErr()).toEqual(errVal._unsafeUnwrapErr())
  })

  it('Maps over an Err', () => {
    const errVal = err('Round 1, Fight!')

    const mapper = jest.fn(
      (error: string) => error.replace('1', '2')
    )

    const mapped = errVal.mapErr(mapper)

    expect(mapped.isErr()).toBe(true)
    expect(mapper).toHaveBeenCalledTimes(1)
    expect(mapped._unsafeUnwrapErr()).not.toEqual(errVal._unsafeUnwrapErr())
  })

  it('Skips over andThen', () => {
    const errVal = err('Yolo')

    const mapper = jest.fn(
      (_val) => ok<string, string>('yooyo')
    )

    const hopefullyNotFlattened = errVal.andThen(mapper)

    expect(hopefullyNotFlattened.isErr()).toBe(true)
    expect(mapper).not.toHaveBeenCalled()
    expect(errVal._unsafeUnwrapErr()).toEqual('Yolo')
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
      return Promise.resolve(
        ok('Very Nice!')
      )
    })

    const errVal = err('nooooooo')

    const promise = errVal.asyncMap(asyncMapper)

    expect(promise).toBeInstanceOf(Promise)

    const sameResult = await promise

    expect(sameResult.isErr()).toBe(true)
    expect(asyncMapper).not.toHaveBeenCalled()
    expect(sameResult._unsafeUnwrapErr()).toEqual(errVal._unsafeUnwrapErr())
  })

  it('Matches on an Err', () => {
    const okMapper = jest.fn((_val) => 'weeeeee')
    const errMapper = jest.fn((_val) => 'wooooo')

    const matched = err(12).match(
      okMapper,
      errMapper
    )

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
})
