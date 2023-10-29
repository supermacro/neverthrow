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

// These tests are intentionally made to emit type-check errors 
// to show the (current) limitation of type-inferrence with safeTry.
describe("Type-check error samples", () => {
  // yield*'s E is not narrowed well
  safeTry<unknown, "error">(function*() {
    yield* ok(undefined)
      .mapErr(() => "error") // This should be narrowed to "error", but is inferred to string
      .safeUnwrap()

    return ok(undefined)
  })

  // Type-check error is not emitted where the wrong value is made, but is always emitted
  // as the generator-function's error
  safeTry<"ok", unknown>(function*() { // Here errors are emitted, but they are not easy to understand.
    return ok("OK") // A type-check error should be emitted here, but is not.
  })
  safeTry<unknown, "error">(function*() { // Here errors are emitted, but they are not easy to understand.
    return err("ERROR") // A type-check error should be emitted here, but is not.
  })
})

