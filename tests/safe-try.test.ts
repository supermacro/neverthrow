import {
  safeTry,
  ok,
  okAsync,
  err,
  errAsync,
  Ok,
  Err
} from "../src"

describe('Returns what is returned from the generator function', () => {
  const val = "value"

  test("With synchronous Ok", () => {
    const res = safeTry(function*() {
      return ok(val)
    })
    expect(res).toBeInstanceOf(Ok)
    expect(res._unsafeUnwrap()).toBe(val)
  })

  test("With synchronous Err", () => {
    const res = safeTry(function*() {
      return err(val)
    })
    expect(res).toBeInstanceOf(Err)
    expect(res._unsafeUnwrapErr()).toBe(val)
  })

  test("With async Ok", async () => {
    const res = await safeTry(async function*() {
      return await okAsync(val)
    })
    expect(res).toBeInstanceOf(Ok)
    expect(res._unsafeUnwrap()).toBe(val)
  })

  test("With async Err", async () => {
    const res = await safeTry(async function*() {
      return await errAsync(val)
    })
    expect(res).toBeInstanceOf(Err)
    expect(res._unsafeUnwrapErr()).toBe(val)
  })
})

describe("Returns the first occurence of Err instance as yiled*'s operand", () => {
  test("With synchronous results", () => {
    const errVal = "err"
    const okValues = Array<string>()

    const result = safeTry(function*() {
      const okFoo = yield* ok("foo").safeUnwrap()
      okValues.push(okFoo)

      const okBar = yield* ok("bar").safeUnwrap()
      okValues.push(okBar)

      yield* err(errVal).safeUnwrap()

      throw new Error("This line should not be executed")
    })

    expect(okValues).toMatchObject(["foo", "bar"])

    expect(result).toBeInstanceOf(Err)
    expect(result._unsafeUnwrapErr()).toBe(errVal)
  })

  test("With async results", async () => {
    const errVal = "err"
    const okValues = Array<string>()

    const result = await safeTry(async function*() {
      const okFoo = yield* okAsync("foo").safeUnwrap()
      okValues.push(okFoo)

      const okBar = yield* okAsync("bar").safeUnwrap()
      okValues.push(okBar)

      yield* errAsync(errVal).safeUnwrap()

      throw new Error("This line should not be executed")
    })

    expect(okValues).toMatchObject(["foo", "bar"])

    expect(result).toBeInstanceOf(Err)
    expect(result._unsafeUnwrapErr()).toBe(errVal)
  })

  test("Mix results of synchronous and async in AsyncGenerator", async () => {
    const errVal = "err"
    const okValues = Array<string>()

    const result = await safeTry(async function*() {
      const okFoo = yield* okAsync("foo").safeUnwrap()
      okValues.push(okFoo)

      const okBar = yield* ok("bar").safeUnwrap()
      okValues.push(okBar)

      yield* err(errVal).safeUnwrap()

      throw new Error("This line should not be executed")
    })

    expect(okValues).toMatchObject(["foo", "bar"])

    expect(result).toBeInstanceOf(Err)
    expect(result._unsafeUnwrapErr()).toBe(errVal)
  })
})
