import { ok, err, Ok, Err } from '../src'

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

  it('Flattens to a new Ok', () => {
    const okVal = ok(12)

    const flattened = okVal.extend((_number) => {
      // ...
      // complex logic
      // ... 
      return ok({ data: 'why not' })
    })

    expect(flattened.isOk()).toBe(true)
    expect(flattened._unsafeUnwrap()).toStrictEqual({ data: 'why not' })
  })

  it('Flattens to an Err', () => {
    const okval = ok(12)

    const flattened = okval.extend((_number) => {
      // ...
      // complex logic
      // ... 
      return err('Whoopsies!')
    })

    expect(flattened.isOk()).toBe(false)
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
})

describe('Result.Err', () => {
  it('Creates an Err value', () => {
    const errVal = err('I have you now.')
    
    expect(errVal.isOk()).toBe(false)
    expect(errVal.isErr()).toBe(true)
    expect(errVal).toBeInstanceOf(Err)
  })

  it('Throws when you unwrap an Err', () => {
    const errVal = err('woopsies')

    expect(() => {
      errVal._unsafeUnwrap()
    }).toThrowError()
  })

  test.todo('Maps over an Err')
  test.todo('Skips `map`')
})
