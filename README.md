# NeverThrow 🙅

[![GitHub Workflow Status](https://github.com/supermacro/neverthrow/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/supermacro/neverthrow/actions)

## Description

Encode failure into your program.

This package contains a `Result` type that represents either success (`Ok`) or failure (`Err`).

For asynchronous tasks, `neverthrow` offers a `ResultAsync` class which wraps a `Promise<Result<T, E>>` and gives you the same level of expressivity and control as a regular `Result<T, E>`.

`ResultAsync` is `thenable` meaning it **behaves exactly like a native `Promise<Result>`** ... except you have access to the same methods that `Result` provides without having to `await` or `.then` the promise! Check out [the wiki](https://github.com/supermacro/neverthrow/wiki/Basic-Usage-Examples#asynchronous-api) for examples and best practices.

> Need to see real-life examples of how to leverage this package for error handling? See this repo: https://github.com/parlez-vous/server

<div id="toc"></div>

## Table Of Contents

* [Installation](#installation)
* [Recommended: Use `eslint-plugin-neverthrow`](#recommended-use-eslint-plugin-neverthrow)
* [Top-Level API](#top-level-api)
* [API Documentation](#api-documentation)
  + [Synchronous API (`Result`)](#synchronous-api-result)
    - [`ok`](#ok)
    - [`err`](#err)
    - [`Result.isOk` (method)](#resultisok-method)
    - [`Result.isErr` (method)](#resultiserr-method)
    - [`Result.map` (method)](#resultmap-method)
    - [`Result.mapErr` (method)](#resultmaperr-method)
    - [`Result.unwrapOr` (method)](#resultunwrapor-method)
    - [`Result.andThen` (method)](#resultandthen-method)
    - [`Result.asyncAndThen` (method)](#resultasyncandthen-method)
    - [`Result.orElse` (method)](#resultorelse-method)
    - [`Result.match` (method)](#resultmatch-method)
    - [`Result.asyncMap` (method)](#resultasyncmap-method)
    - [`Result.andTee` (method)](#resultandtee-method)
    - [`Result.andThrough` (method)](#resultandthrough-method)
    - [`Result.asyncAndThrough` (method)](#resultasyncandthrough-method)
    - [`Result.fromThrowable` (static class method)](#resultfromthrowable-static-class-method)
    - [`Result.combine` (static class method)](#resultcombine-static-class-method)
    - [`Result.combineWithAllErrors` (static class method)](#resultcombinewithallerrors-static-class-method)
    - [`Result.safeUnwrap()`](#resultsafeunwrap)
  + [Asynchronous API (`ResultAsync`)](#asynchronous-api-resultasync)
    - [`okAsync`](#okasync)
    - [`errAsync`](#errasync)
    - [`ResultAsync.fromThrowable` (static class method)](#resultasyncfromthrowable-static-class-method)
    - [`ResultAsync.fromPromise` (static class method)](#resultasyncfrompromise-static-class-method)
    - [`ResultAsync.fromSafePromise` (static class method)](#resultasyncfromsafepromise-static-class-method)
    - [`ResultAsync.map` (method)](#resultasyncmap-method)
    - [`ResultAsync.mapErr` (method)](#resultasyncmaperr-method)
    - [`ResultAsync.unwrapOr` (method)](#resultasyncunwrapor-method)
    - [`ResultAsync.andThen` (method)](#resultasyncandthen-method)
    - [`ResultAsync.orElse` (method)](#resultasyncorelse-method)
    - [`ResultAsync.match` (method)](#resultasyncmatch-method)
    - [`ResultAsync.andTee` (method)](#resultasyncandtee-method)
    - [`ResultAsync.andThrough` (method)](#resultasyncandthrough-method)
    - [`ResultAsync.combine` (static class method)](#resultasynccombine-static-class-method)
    - [`ResultAsync.combineWithAllErrors` (static class method)](#resultasynccombinewithallerrors-static-class-method)
    - [`ResultAsync.safeUnwrap()`](#resultasyncsafeunwrap)
  + [Utilities](#utilities)
    - [`fromThrowable`](#fromthrowable)
    - [`fromAsyncThrowable`](#fromasyncthrowable)
    - [`fromPromise`](#frompromise)
    - [`fromSafePromise`](#fromsafepromise)
    - [`safeTry`](#safetry)
  + [Testing](#testing)
* [A note on the Package Name](#a-note-on-the-package-name)

## Installation

```sh
> npm install neverthrow
```

## Recommended: Use `eslint-plugin-neverthrow`

As part of `neverthrow`s [bounty program](https://github.com/supermacro/neverthrow/issues/314), user [mdbetancourt](https://github.com/mdbetancourt) created [`eslint-plugin-neverthrow`](https://github.com/mdbetancourt/eslint-plugin-neverthrow) to ensure that errors are not gone unhandled.

Install by running:

```sh
> npm install eslint-plugin-neverthrow
```

With `eslint-plugin-neverthrow`, you are forced to consume the result in one of the following three ways:

- Calling `.match`
- Calling `.unwrapOr`
- Calling `._unsafeUnwrap`

This ensures that you're explicitly handling the error of your `Result`.

This plugin is essentially a porting of Rust's [`must-use`](https://doc.rust-lang.org/std/result/#results-must-be-used) attribute. 


## Top-Level API

`neverthrow` exposes the following:

- `ok` convenience function to create an `Ok` variant of `Result`
- `err` convenience function to create an `Err` variant of `Result`
- `Ok` class and type
- `Err` class and type
- `Result` Type as well as namespace / object from which to call [`Result.fromThrowable`](#resultfromthrowable-static-class-method), [Result.combine](#resultcombine-static-class-method).
- `ResultAsync` class
- `okAsync` convenience function to create a `ResultAsync` containing an `Ok` type `Result`
- `errAsync` convenience function to create a `ResultAsync` containing an `Err` type `Result`

```typescript
import {
  ok,
  Ok,
  err,
  Err,
  Result,
  okAsync,
  errAsync,
  ResultAsync,
  fromAsyncThrowable,
  fromThrowable,
  fromPromise,
  fromSafePromise,
  safeTry,
} from 'neverthrow'
```

---

**Check out the [wiki](https://github.com/supermacro/neverthrow/wiki) for help on how to make the most of `neverthrow`.**

If you find this package useful, please consider [sponsoring me](https://github.com/sponsors/supermacro/) or simply [buying me a coffee](https://ko-fi.com/gdelgado)!

---

## API Documentation

### Synchronous API (`Result`)

#### `ok`

Constructs an `Ok` variant of `Result`

**Signature:**

```typescript
ok<T, E>(value: T): Ok<T, E> { ... }
```

**Example:**

```typescript
import { ok } from 'neverthrow'

const myResult = ok({ myData: 'test' }) // instance of `Ok`

myResult.isOk() // true
myResult.isErr() // false
```

[⬆️  Back to top](#toc)

---

#### `err`

Constructs an `Err` variant of `Result`

**Signature:**

```typescript
err<T, E>(error: E): Err<T, E> { ... }
```

**Example:**

```typescript
import { err } from 'neverthrow'

const myResult = err('Oh noooo') // instance of `Err`

myResult.isOk() // false
myResult.isErr() // true
```

[⬆️  Back to top](#toc)

---

#### `Result.isOk` (method)

Returns `true` if the result is an `Ok` variant

**Signature:**

```typescript
isOk(): boolean { ... }
```

[⬆️  Back to top](#toc)

---

#### `Result.isErr` (method)

Returns `true` if the result is an `Err` variant

**Signature**:

```typescript
isErr(): boolean { ... }
```

[⬆️  Back to top](#toc)

---

#### `Result.map` (method)

Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.

This function can be used to compose the results of two functions.

**Signature:**

```typescript
class Result<T, E> {
  map<U>(callback: (value: T) => U): Result<U, E> { ... }
}
```

**Example**:

```typescript
import { getLines } from 'imaginary-parser'
// ^ assume getLines has the following signature:
// getLines(str: string): Result<Array<string>, Error>

// since the formatting is deemed correct by `getLines`
// then it means that `linesResult` is an Ok
// containing an Array of strings for each line of code
const linesResult = getLines('1\n2\n3\n4\n')

// this Result now has a Array<number> inside it
const newResult = linesResult.map(
  (arr: Array<string>) => arr.map(parseInt)
)

newResult.isOk() // true
```

[⬆️  Back to top](#toc)

---

#### `Result.mapErr` (method)

Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.

This function can be used to pass through a successful result while handling an error.

**Signature:**

```typescript
class Result<T, E> {
  mapErr<F>(callback: (error: E) => F): Result<T, F> { ... }
}
```

**Example**:

```typescript
import { parseHeaders } from 'imaginary-http-parser'
// imagine that parseHeaders has the following signature:
// parseHeaders(raw: string): Result<SomeKeyValueMap, ParseError>

const rawHeaders = 'nonsensical gibberish and badly formatted stuff'

const parseResult = parseHeaders(rawHeaders)

parseResult.mapErr(parseError => {
  res.status(400).json({
    error: parseError
  })
})

parseResult.isErr() // true
```

[⬆️  Back to top](#toc)

---

#### `Result.unwrapOr` (method)

Unwrap the `Ok` value, or return the default if there is an `Err`

**Signature:**

```typescript
class Result<T, E> {
  unwrapOr<T>(value: T): T { ... }
}
```

**Example**:

```typescript
const myResult = err('Oh noooo')

const multiply = (value: number): number => value * 2

const unwrapped: number = myResult.map(multiply).unwrapOr(10)
```

[⬆️  Back to top](#toc)

---

#### `Result.andThen` (method)

Same idea as `map` above. Except you must return a new `Result`.

The returned value will be a `Result`. As of `v4.1.0-beta`, you are able to return distinct error types (see signature below). Prior to `v4.1.0-beta`, the error type could not be distinct.

This is useful for when you need to do a subsequent computation using the inner `T` value, but that computation might fail.

Additionally, `andThen` is really useful as a tool to flatten a `Result<Result<A, E2>, E1>` into a `Result<A, E2>` (see example below).

**Signature:**

```typescript
class Result<T, E> {
  // Note that the latest version lets you return distinct errors as well.
  // If the error types (E and F) are the same (like `string | string`)
  // then they will be merged into one type (`string`)
  andThen<U, F>(
    callback: (value: T) => Result<U, F>
  ): Result<U, E | F> { ... }
}
```

**Example 1: Chaining Results**

```typescript
import { err, ok } from 'neverthrow'

const sq = (n: number): Result<number, number> => ok(n ** 2)

ok(2)
  .andThen(sq)
  .andThen(sq) // Ok(16)

ok(2)
  .andThen(sq)
  .andThen(err) // Err(4)

ok(2)
  .andThen(err)
  .andThen(sq) // Err(2)

err(3)
  .andThen(sq)
  .andThen(sq) // Err(3)
```

**Example 2: Flattening Nested Results**

```typescript
// It's common to have nested Results
const nested = ok(ok(1234))

// notNested is a Ok(1234)
const notNested = nested.andThen((innerResult) => innerResult)
```

[⬆️  Back to top](#toc)

---

#### `Result.asyncAndThen` (method)

Same idea as [`andThen` above](#resultandthen-method), except you must return a new `ResultAsync`.

The returned value will be a `ResultAsync`.

**Signature:**

```typescript
class Result<T, E> {
  asyncAndThen<U, F>(
    callback: (value: T) => ResultAsync<U, F>
  ): ResultAsync<U, E | F> { ... }
}
```

[⬆️  Back to top](#toc)

---

#### `Result.orElse` (method)

Takes an `Err` value and maps it to a `Result<T, SomeNewType>`. This is useful for error recovery.

**Signature:**

```typescript
class Result<T, E> {
  orElse<A>(
    callback: (error: E) => Result<T, A>
  ): Result<T, A> { ... }
}
```

**Example:**

```typescript
enum DatabaseError {
  PoolExhausted = 'PoolExhausted',
  NotFound = 'NotFound',
}

const dbQueryResult: Result<string, DatabaseError> = err(DatabaseError.NotFound)

const updatedQueryResult = dbQueryResult.orElse((dbError) =>
  dbError === DatabaseError.NotFound
    ? ok('User does not exist') // error recovery branch: ok() must be called with a value of type string
    //
    //
    // err() can be called with a value of any new type that you want
    // it could also be called with the same error value
    //     
    //     err(dbError)
    : err(500) 
)
```

[⬆️  Back to top](#toc)

---

#### `Result.match` (method)

Given 2 functions (one for the `Ok` variant and one for the `Err` variant) execute the function that matches the `Result` variant.

Match callbacks do not necessitate to return a `Result`, however you can return a `Result` if you want to.

**Signature:**

```typescript
class Result<T, E> {
  match<A, B = A>(
    okCallback: (value: T) =>  A,
    errorCallback: (error: E) =>  B
  ): A | B => { ... }
}
```

`match` is like chaining `map` and `mapErr`, with the distinction that with `match` both functions must have the same return type.
The differences between `match` and chaining `map` and `mapErr` are that:
- with `match` both functions must have the same return type `A`
- `match` unwraps the `Result<T, E>` into an `A` (the match functions' return type)
  - This makes no difference if you are performing side effects only

**Example:**

```typescript
// map/mapErr api
// note that you DON'T have to append mapErr
// after map which means that you are not required to do
// error handling
computationThatMightFail().map(console.log).mapErr(console.error)

// match api
// works exactly the same as above since both callbacks
// only perform side effects,
// except, now you HAVE to do error handling :)
computationThatMightFail().match(console.log, console.error)

// Returning values
const attempt = computationThatMightFail()
  .map((str) => str.toUpperCase())
  .mapErr((err) => `Error: ${err}`)
// `attempt` is of type `Result<string, string>`

const answer = computationThatMightFail().match(
  (str) => str.toUpperCase(),
  (err) => `Error: ${err}`
)
// `answer` is of type `string`
```

If you don't use the error parameter in your match callback then `match` is equivalent to chaining `map` with `unwrapOr`:
```ts
const answer = computationThatMightFail().match(
  (str) => str.toUpperCase(),
  () => 'ComputationError'
)
// `answer` is of type `string`

const answer = computationThatMightFail()
  .map((str) => str.toUpperCase())
  .unwrapOr('ComputationError')
```


[⬆️  Back to top](#toc)

---

#### `Result.asyncMap` (method)

Similar to `map` except for two things:

- the mapping function must return a `Promise`
- asyncMap returns a `ResultAsync`

You can then chain the result of `asyncMap` using the `ResultAsync` apis (like `map`, `mapErr`, `andThen`, etc.)

**Signature:**

```typescript
class Result<T, E> {
  asyncMap<U>(
    callback: (value: T) => Promise<U>
  ): ResultAsync<U, E> { ... }
}
```

**Example:**

```typescript
import { parseHeaders } from 'imaginary-http-parser'
// imagine that parseHeaders has the following signature:
// parseHeaders(raw: string): Result<SomeKeyValueMap, ParseError>

const asyncRes = parseHeaders(rawHeader)
  .map(headerKvMap => headerKvMap.Authorization)
  .asyncMap(findUserInDatabase)
```

Note that in the above example if `parseHeaders` returns an `Err` then `.map` and `.asyncMap` will not be invoked, and `asyncRes` variable will resolve to an `Err` when turned into a `Result` using `await` or `.then()`.
  
[⬆️  Back to top](#toc)

---

#### `Result.andTee` (method)

Takes a `Result<T, E>` and lets the original `Result<T, E>` pass through regardless the result of the passed-in function.
This is a handy way to handle side effects whose failure or success should not affect your main logics such as logging. 

**Signature:**

```typescript
class Result<T, E> {
  andTee(
    callback: (value: T) => unknown
  ): Result<T, E> { ... }
}
```

**Example:**

```typescript
import { parseUserInput } from 'imaginary-parser'
import { logUser } from 'imaginary-logger'
import { insertUser } from 'imaginary-database'

// ^ assume parseUserInput, logUser and insertUser have the following signatures:
// parseUserInput(input: RequestData): Result<User, ParseError>
// logUser(user: User): Result<void, LogError> 
// insertUser(user: User): ResultAsync<void, InsertError>
// Note logUser returns void upon success but insertUser takes User type.

const resAsync = parseUserInput(userInput)
               .andTee(logUser)
               .asyncAndThen(insertUser)

// Note no LogError shows up in the Result type
resAsync.then((res: Result<void, ParseError | InsertError>) => {e
  if(res.isErr()){
    console.log("Oops, at least one step failed", res.error)
  }
  else{
    console.log("User input has been parsed and inserted successfully.")
  }
}))
```

[⬆️  Back to top](#toc)

---

#### `Result.andThrough` (method)

Similar to `andTee` except for:

- when there is an error from the passed-in function, that error will be passed along.

**Signature:**

```typescript
class Result<T, E> {
  andThrough<F>(
    callback: (value: T) => Result<unknown, F>
  ): Result<T, E | F> { ... }
}
```

**Example:**

```typescript
import { parseUserInput } from 'imaginary-parser'
import { validateUser } from 'imaginary-validator'
import { insertUser } from 'imaginary-database'

// ^ assume parseUseInput, validateUser and insertUser have the following signatures:
// parseUserInput(input: RequestData): Result<User, ParseError>
// validateUser(user: User): Result<void, ValidateError>
// insertUser(user: User): ResultAsync<void, InsertError>
// Note validateUser returns void upon success but insertUser takes User type. 

const resAsync = parseUserInput(userInput)
               .andThrough(validateUser)
               .asyncAndThen(insertUser)

resAsync.then((res: Result<void, ParseErro | ValidateError | InsertError>) => {e
  if(res.isErr()){
    console.log("Oops, at least one step failed", res.error)
  }
  else{
    console.log("User input has been parsed, validated, inserted successfully.")
  }
}))
```
  
[⬆️  Back to top](#toc)

---

#### `Result.asyncAndThrough` (method)

Similar to `andThrough` except you must return a ResultAsync. 

You can then chain the result of `asyncAndThrough` using the `ResultAsync` apis (like `map`, `mapErr`, `andThen`, etc.)

**Signature:**

```typescript
import { parseUserInput } from 'imaginary-parser'
import { insertUser } from 'imaginary-database'
import { sendNotification } from 'imaginary-service'

// ^ assume parseUserInput, insertUser and sendNotification have the following signatures:
// parseUserInput(input: RequestData): Result<User, ParseError>
// insertUser(user: User): ResultAsync<void, InsertError>
// sendNotification(user: User): ResultAsync<void, NotificationError>
// Note insertUser returns void upon success but sendNotification takes User type. 

const resAsync = parseUserInput(userInput)
               .asyncAndThrough(insertUser)
               .andThen(sendNotification)

resAsync.then((res: Result<void, ParseError | InsertError | NotificationError>) => {e
  if(res.isErr()){
    console.log("Oops, at least one step failed", res.error)
  }
  else{
    console.log("User has been parsed, inserted and notified successfully.")
  }
}))
```
  
[⬆️  Back to top](#toc)

---
#### `Result.fromThrowable` (static class method)

> Although Result is not an actual JS class, the way that `fromThrowable` has been implemented requires that you call `fromThrowable` as though it were a static method on `Result`. See examples below.

The JavaScript community has agreed on the convention of throwing exceptions.
As such, when interfacing with third party libraries it's imperative that you
wrap third-party code in try / catch blocks.

This function will create a new function that returns an `Err` when the original
function throws.

It is not possible to know the types of the errors thrown in the original
function, therefore it is recommended to use the second argument `errorFn` to
map what is thrown to a known type.

**Example**:

```typescript
import { Result } from 'neverthrow'

type ParseError = { message: string }
const toParseError = (): ParseError => ({ message: "Parse Error" })

const safeJsonParse = Result.fromThrowable(JSON.parse, toParseError)

// the function can now be used safely, if the function throws, the result will be an Err
const res = safeJsonParse("{");
```

[⬆️  Back to top](#toc)

---

#### `Result.combine` (static class method)

> Although Result is not an actual JS class, the way that `combine` has been implemented requires that you call `combine` as though it were a static method on `Result`. See examples below.

Combine lists of `Result`s.

If you're familiar with `Promise.all`, the combine function works conceptually the same.

**`combine` works on both heterogeneous and homogeneous lists**. This means that you can have lists that contain different kinds of `Result`s and still be able to combine them. Note that you cannot combine lists that contain both `Result`s **and** `ResultAsync`s.

The combine function takes a list of results and returns a single result. If all the results in the list are `Ok`, then the return value will be a `Ok` containing a list of all the individual `Ok` values.

If just one of the results in the list is an `Err` then the combine function returns that Err value (it short circuits and returns the first Err that it finds).

Formally speaking:

```typescript
// homogeneous lists
function combine<T, E>(resultList: Result<T, E>[]): Result<T[], E>

// heterogeneous lists
function combine<T1, T2, E1, E2>(resultList: [ Result<T1, E1>, Result<T2, E2> ]): Result<[ T1, T2 ], E1 | E2>
function combine<T1, T2, T3, E1, E2, E3> => Result<[ T1, T2, T3 ], E1 | E2 | E3>
function combine<T1, T2, T3, T4, E1, E2, E3, E4> => Result<[ T1, T2, T3, T4 ], E1 | E2 | E3 | E4>
// ... etc etc ad infinitum

```

Example:
```typescript
const resultList: Result<number, never>[] =
  [ok(1), ok(2)]

const combinedList: Result<number[], unknown> =
  Result.combine(resultList)
```

Example with tuples:
```typescript
/** @example tuple(1, 2, 3) === [1, 2, 3] // with type [number, number, number] */
const tuple = <T extends any[]>(...args: T): T => args

const resultTuple: [Result<string, never>, Result<string, never>] =
  tuple(ok('a'), ok('b'))

const combinedTuple: Result<[string, string], unknown> =
  Result.combine(resultTuple)
```

[⬆️  Back to top](#toc)

---

#### `Result.combineWithAllErrors` (static class method)

> Although Result is not an actual JS class, the way that `combineWithAllErrors` has been implemented requires that you call `combineWithAllErrors` as though it were a static method on `Result`. See examples below.

Like `combine` but without short-circuiting. Instead of just the first error value, you get a list of all error values of the input result list.

If only some results fail, the new combined error list will only contain the error value of the failed results, meaning that there is no guarantee of the length of the new error list.

Function signature:

```typescript
// homogeneous lists
function combineWithAllErrors<T, E>(resultList: Result<T, E>[]): Result<T[], E[]>

// heterogeneous lists
function combineWithAllErrors<T1, T2, E1, E2>(resultList: [ Result<T1, E1>, Result<T2, E2> ]): Result<[ T1, T2 ], (E1 | E2)[]>
function combineWithAllErrors<T1, T2, T3, E1, E2, E3> => Result<[ T1, T2, T3 ], (E1 | E2 | E3)[]>
function combineWithAllErrors<T1, T2, T3, T4, E1, E2, E3, E4> => Result<[ T1, T2, T3, T4 ], (E1 | E2 | E3 | E4)[]>
// ... etc etc ad infinitum
```

Example usage:

```typescript
const resultList: Result<number, string>[] = [
  ok(123),
  err('boooom!'),
  ok(456),
  err('ahhhhh!'),
]

const result = Result.combineWithAllErrors(resultList)

// result is Err(['boooom!', 'ahhhhh!'])
```

[⬆️  Back to top](#toc)

#### `Result.safeUnwrap()`

**⚠️ You must use `.safeUnwrap` in a generator context with `safeTry`**. Please see [safeTry](#safeTry).

Allows for unwrapping a `Result` or returning an `Err` implicitly, thereby reducing boilerplate.


[⬆️  Back to top](#toc)

---

### Asynchronous API (`ResultAsync`)

#### `okAsync`

Constructs an `Ok` variant of `ResultAsync`

**Signature:**

```typescript
okAsync<T, E>(value: T): ResultAsync<T, E>
```

**Example:**

```typescript
import { okAsync } from 'neverthrow'

const myResultAsync = okAsync({ myData: 'test' }) // instance of `ResultAsync`

const myResult = await myResultAsync // instance of `Ok`

myResult.isOk() // true
myResult.isErr() // false
```

[⬆️  Back to top](#toc)

---

#### `errAsync`

Constructs an `Err` variant of `ResultAsync`

**Signature:**

```typescript
errAsync<T, E>(error: E): ResultAsync<T, E>
```

**Example:**

```typescript
import { errAsync } from 'neverthrow'

const myResultAsync = errAsync('Oh nooo') // instance of `ResultAsync`

const myResult = await myResultAsync // instance of `Err`

myResult.isOk() // false
myResult.isErr() // true
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.fromThrowable` (static class method)

Similar to [Result.fromThrowable](#resultfromthrowable-static-class-method), but for functions that return a `Promise`.

**Example**:

```typescript
import { ResultAsync } from 'neverthrow'
import { insertIntoDb } from 'imaginary-database'
// insertIntoDb(user: User): Promise<User>

const insertUser = ResultAsync.fromThrowable(insertIntoDb, () => new Error('Database error'))
// `res` has a type of (user: User) => ResultAsync<User, Error>
```

Note that this can be safer than using [ResultAsync.fromPromise](#resultasyncfrompromise-static-class-method) with
the result of a function call, because not all functions that return a `Promise` are `async`, and thus they can throw
errors synchronously rather than returning a rejected `Promise`. For example:

```typescript
// NOT SAFE !!
import { ResultAsync } from 'neverthrow'
import { db } from 'imaginary-database'
// db.insert<T>(table: string, value: T): Promise<T>

const insertUser = (user: User): Promise<User> => {
  if (!user.id) {
    // this throws synchronously!
    throw new TypeError('missing user id')
  }
  return db.insert('users', user)
}

// this will throw, NOT return a `ResultAsync`
const res = ResultAsync.fromPromise(insertIntoDb(myUser), () => new Error('Database error'))
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.fromPromise` (static class method)

Transforms a `PromiseLike<T>` (that may throw) into a `ResultAsync<T, E>`.

The second argument handles the rejection case of the promise and maps the error from `unknown` into some type `E`.


**Signature:**

```typescript
// fromPromise is a static class method
// also available as a standalone function
// import { fromPromise } from 'neverthrow'
ResultAsync.fromPromise<T, E>(
  promise: PromiseLike<T>,
  errorHandler: (unknownError: unknown) => E)
): ResultAsync<T, E> { ... }
```

If you are working with `PromiseLike` objects that you **know for a fact** will not throw, then use `fromSafePromise` in order to avoid having to pass a redundant `errorHandler` argument.

**Example**:

```typescript
import { ResultAsync } from 'neverthrow'
import { insertIntoDb } from 'imaginary-database'
// insertIntoDb(user: User): Promise<User>

const res = ResultAsync.fromPromise(insertIntoDb(myUser), () => new Error('Database error'))
// `res` has a type of ResultAsync<User, Error>
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.fromSafePromise` (static class method)

Same as `ResultAsync.fromPromise` except that it does not handle the rejection of the promise. **Ensure you know what you're doing, otherwise a thrown exception within this promise will cause ResultAsync to reject, instead of resolve to a Result.**

**Signature:**

```typescript
// fromPromise is a static class method
// also available as a standalone function
// import { fromPromise } from 'neverthrow'
ResultAsync.fromSafePromise<T, E>(
  promise: PromiseLike<T>
): ResultAsync<T, E> { ... }
```

**Example**:

```typescript
import { RouteError } from 'routes/error'

// simulate slow routes in an http server that works in a Result / ResultAsync context
// Adopted from https://github.com/parlez-vous/server/blob/2496bacf55a2acbebc30631b5562f34272794d76/src/routes/common/signup.ts
export const slowDown = <T>(ms: number) => (value: T) =>
  ResultAsync.fromSafePromise<T, RouteError>(
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(value)
      }, ms)
    })
  )

export const signupHandler = route<User>((req, sessionManager) =>
  decode(userSignupDecoder, req.body, 'Invalid request body').map((parsed) => {
    return createUser(parsed)
      .andThen(slowDown(3000)) // slowdown by 3 seconds
      .andThen(sessionManager.createSession)
      .map(({ sessionToken, admin }) => AppData.init(admin, sessionToken))
  })
)
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.map` (method)

Maps a `ResultAsync<T, E>` to `ResultAsync<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.

The applied function can be synchronous or asynchronous (returning a `Promise<U>`) with no impact to the return type.

This function can be used to compose the results of two functions.

**Signature:**

```typescript
class ResultAsync<T, E> {
  map<U>(
    callback: (value: T) => U | Promise<U>
  ): ResultAsync<U, E> { ... }
}
```

**Example**:

```typescript
import { findUsersIn } from 'imaginary-database'
// ^ assume findUsersIn has the following signature:
// findUsersIn(country: string): ResultAsync<Array<User>, Error>

const usersInCanada = findUsersIn("Canada")

// Let's assume we only need their names
const namesInCanada = usersInCanada.map((users: Array<User>) => users.map(user => user.name))
// namesInCanada is of type ResultAsync<Array<string>, Error>

// We can extract the Result using .then() or await
namesInCanada.then((namesResult: Result<Array<string>, Error>) => {
  if(namesResult.isErr()){
    console.log("Couldn't get the users from the database", namesResult.error)
  }
  else{
    console.log("Users in Canada are named: " + namesResult.value.join(','))
  }
})
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.mapErr` (method)

Maps a `ResultAsync<T, E>` to `ResultAsync<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.

The applied function can be synchronous or asynchronous (returning a `Promise<F>`) with no impact to the return type.

This function can be used to pass through a successful result while handling an error.

**Signature:**

```typescript
class ResultAsync<T, E> {
  mapErr<F>(
    callback: (error: E) => F | Promise<F>
  ): ResultAsync<T, F> { ... }
}
```

**Example**:

```typescript
import { findUsersIn } from 'imaginary-database'
// ^ assume findUsersIn has the following signature:
// findUsersIn(country: string): ResultAsync<Array<User>, Error>

// Let's say we need to low-level errors from findUsersIn to be more readable
const usersInCanada = findUsersIn("Canada").mapErr((error: Error) => {
  // The only error we want to pass to the user is "Unknown country"
  if(error.message === "Unknown country"){
    return error.message
  }
  // All other errors will be labelled as a system error
  return "System error, please contact an administrator."
})

// usersInCanada is of type ResultAsync<Array<User>, string>

usersInCanada.then((usersResult: Result<Array<User>, string>) => {
  if(usersResult.isErr()){
    res.status(400).json({
      error: usersResult.error
    })
  }
  else{
    res.status(200).json({
      users: usersResult.value
    })
  }
})
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.unwrapOr` (method)

Unwrap the `Ok` value, or return the default if there is an `Err`.  
Works just like `Result.unwrapOr` but returns a `Promise<T>` instead of `T`.

**Signature:**

```typescript
class ResultAsync<T, E> {
  unwrapOr<T>(value: T): Promise<T> { ... }
}
```

**Example**:

```typescript
const unwrapped: number = await errAsync(0).unwrapOr(10)
// unwrapped = 10
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.andThen` (method)

Same idea as `map` above. Except the applied function must return a `Result` or `ResultAsync`.

`ResultAsync.andThen` always returns a `ResultAsync` no matter the return type of the applied function.

This is useful for when you need to do a subsequent computation using the inner `T` value, but that computation might fail.

`andThen` is really useful as a tool to flatten a `ResultAsync<ResultAsync<A, E2>, E1>` into a `ResultAsync<A, E2>` (see example below).

**Signature:**

```typescript
// Note that the latest version (v4.1.0-beta) lets you return distinct errors as well.
// If the error types (E and F) are the same (like `string | string`)
// then they will be merged into one type (`string`)

class ResultAsync<T, E> {
  andThen<U, F>(
    callback: (value: T) => Result<U, F> | ResultAsync<U, F>
  ): ResultAsync<U, E | F> { ... }
}
```

**Example**

```typescript

import { validateUser } from 'imaginary-validator'
import { insertUser } from 'imaginary-database'
import { sendNotification } from 'imaginary-service'

// ^ assume validateUser, insertUser and sendNotification have the following signatures:
// validateUser(user: User): Result<User, Error>
// insertUser(user): ResultAsync<User, Error>
// sendNotification(user): ResultAsync<void, Error>

const resAsync = validateUser(user)
               .andThen(insertUser)
               .andThen(sendNotification)

// resAsync is a ResultAsync<void, Error>

resAsync.then((res: Result<void, Error>) => {
  if(res.isErr()){
    console.log("Oops, at least one step failed", res.error)
  }
  else{
    console.log("User has been validated, inserted and notified successfully.")
  }
})
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.orElse` (method)

Takes an `Err` value and maps it to a `ResultAsync<T, SomeNewType>`. This is useful for error recovery.

**Signature:**

```typescript
class ResultAsync<T, E> {
  orElse<A>(
    callback: (error: E) => Result<T, A> | ResultAsync<T, A>
  ): ResultAsync<T, A> { ... }
}
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.match` (method)

Given 2 functions (one for the `Ok` variant and one for the `Err` variant) execute the function that matches the `ResultAsync` variant.

The difference with `Result.match` is that it always returns a `Promise` because of the asynchronous nature of the `ResultAsync`.

**Signature:**

```typescript
class ResultAsync<T, E> {
  match<A, B = A>(
    okCallback: (value: T) =>  A,
    errorCallback: (error: E) =>  B
  ): Promise<A | B> => { ... }
}
```

**Example:**

```typescript

import { validateUser } from 'imaginary-validator'
import { insertUser } from 'imaginary-database'

// ^ assume validateUser and insertUser have the following signatures:
// validateUser(user: User): Result<User, Error>
// insertUser(user): ResultAsync<User, Error>

// Handle both cases at the end of the chain using match
const resultMessage = await validateUser(user)
        .andThen(insertUser)
        .match(
            (user: User) => `User ${user.name} has been successfully created`,
            (error: Error) =>  `User could not be created because ${error.message}`
        )

// resultMessage is a string
```

[⬆️  Back to top](#toc)

---
#### `ResultAsync.andTee` (method)

Takes a `ResultAsync<T, E>` and lets the original `ResultAsync<T, E>` pass through regardless 
the result of the passed-in function.
This is a handy way to handle side effects whose failure or success should not affect your main logics such as logging. 

**Signature:**

```typescript
class ResultAsync<T, E> {
  andTee(
    callback: (value: T) => unknown
  ): ResultAsync<T, E>  => { ... }
}
```

**Example:**

```typescript
import { insertUser } from 'imaginary-database'
import { logUser } from 'imaginary-logger'
import { sendNotification } from 'imaginary-service'

// ^ assume insertUser, logUser and sendNotification have the following signatures:
// insertUser(user: User): ResultAsync<User, InsertError>
// logUser(user: User): Result<void, LogError>
// sendNotification(user: User): ResultAsync<void, NotificationError>
// Note logUser returns void on success but sendNotification takes User type. 

const resAsync = insertUser(user)
                .andTee(logUser)
                .andThen(sendNotification)

// Note there is no LogError in the types below 
resAsync.then((res: Result<void, InsertError | NotificationError>) => {e
  if(res.isErr()){
    console.log("Oops, at least one step failed", res.error)
  }
  else{
    console.log("User has been inserted and notified successfully.")
  }
}))  
```

[⬆️  Back to top](#toc)

---
#### `ResultAsync.andThrough` (method)


Similar to `andTee` except for:

- when there is an error from the passed-in function, that error will be passed along.

**Signature:**

```typescript
class ResultAsync<T, E> {
  andThrough<F>(
    callback: (value: T) => Result<unknown, F> | ResultAsync<unknown, F>,
  ): ResultAsync<T, E | F> => { ... }
}
```

**Example:**

```typescript

import { buildUser } from 'imaginary-builder'
import { insertUser } from 'imaginary-database'
import { sendNotification } from 'imaginary-service'

// ^ assume buildUser, insertUser and sendNotification have the following signatures:
// buildUser(userRaw: UserRaw): ResultAsync<User, BuildError>
// insertUser(user: User): ResultAsync<void, InsertError>
// sendNotification(user: User): ResultAsync<void, NotificationError>
// Note insertUser returns void upon success but sendNotification takes User type. 

const resAsync = buildUser(userRaw)
                .andThrough(insertUser)
                .andThen(sendNotification)

resAsync.then((res: Result<void, BuildError | InsertError | NotificationError>) => {e
  if(res.isErr()){
    console.log("Oops, at least one step failed", res.error)
  }
  else{
    console.log("User data has been built, inserted and notified successfully.")
  }
}))  
```

[⬆️  Back to top](#toc)

---
#### `ResultAsync.combine` (static class method)

Combine lists of `ResultAsync`s.

If you're familiar with `Promise.all`, the combine function works conceptually the same.

**`combine` works on both heterogeneous and homogeneous lists**. This means that you can have lists that contain different kinds of `ResultAsync`s and still be able to combine them. Note that you cannot combine lists that contain both `Result`s **and** `ResultAsync`s.

The combine function takes a list of results and returns a single result. If all the results in the list are `Ok`, then the return value will be a `Ok` containing a list of all the individual `Ok` values.

If just one of the results in the list is an `Err` then the combine function returns that Err value (it short circuits and returns the first Err that it finds).

Formally speaking:

```typescript
// homogeneous lists
function combine<T, E>(resultList: ResultAsync<T, E>[]): ResultAsync<T[], E>

// heterogeneous lists
function combine<T1, T2, E1, E2>(resultList: [ ResultAsync<T1, E1>, ResultAsync<T2, E2> ]): ResultAsync<[ T1, T2 ], E1 | E2>
function combine<T1, T2, T3, E1, E2, E3> => ResultAsync<[ T1, T2, T3 ], E1 | E2 | E3>
function combine<T1, T2, T3, T4, E1, E2, E3, E4> => ResultAsync<[ T1, T2, T3, T4 ], E1 | E2 | E3 | E4>
// ... etc etc ad infinitum

```

Example:
```typescript
const resultList: ResultAsync<number, never>[] =
  [okAsync(1), okAsync(2)]

const combinedList: ResultAsync<number[], unknown> =
  ResultAsync.combine(resultList)
```

Example with tuples:
```typescript
/** @example tuple(1, 2, 3) === [1, 2, 3] // with type [number, number, number] */
const tuple = <T extends any[]>(...args: T): T => args

const resultTuple: [ResultAsync<string, never>, ResultAsync<string, never>] =
  tuple(okAsync('a'), okAsync('b'))

const combinedTuple: ResultAsync<[string, string], unknown> =
  ResultAsync.combine(resultTuple)
```
[⬆️  Back to top](#toc)

---

#### `ResultAsync.combineWithAllErrors` (static class method)

Like `combine` but without short-circuiting. Instead of just the first error value, you get a list of all error values of the input result list.

If only some results fail, the new combined error list will only contain the error value of the failed results, meaning that there is no guarantee of the length of the new error list.

Function signature:

```typescript
// homogeneous lists
function combineWithAllErrors<T, E>(resultList: ResultAsync<T, E>[]): ResultAsync<T[], E[]>

// heterogeneous lists
function combineWithAllErrors<T1, T2, E1, E2>(resultList: [ ResultAsync<T1, E1>, ResultAsync<T2, E2> ]): ResultAsync<[ T1, T2 ], (E1 | E2)[]>
function combineWithAllErrors<T1, T2, T3, E1, E2, E3> => ResultAsync<[ T1, T2, T3 ], (E1 | E2 | E3)[]>
function combineWithAllErrors<T1, T2, T3, T4, E1, E2, E3, E4> => ResultAsync<[ T1, T2, T3, T4 ], (E1 | E2 | E3 | E4)[]>
// ... etc etc ad infinitum
```

Example usage:

```typescript
const resultList: ResultAsync<number, string>[] = [
  okAsync(123),
  errAsync('boooom!'),
  okAsync(456),
  errAsync('ahhhhh!'),
]

const result = ResultAsync.combineWithAllErrors(resultList)

// result is Err(['boooom!', 'ahhhhh!'])
```

#### `ResultAsync.safeUnwrap()`

**⚠️ You must use `.safeUnwrap` in a generator context with `safeTry`**. Please see [safeTry](#safeTry).

Allows for unwrapping a `Result` or returning an `Err` implicitly, thereby reducing boilerplate.

[⬆️  Back to top](#toc)

---

### Utilities

#### `fromThrowable`

Top level export of `Result.fromThrowable`.
Please find documentation at [Result.fromThrowable](#resultfromthrowable-static-class-method)

[⬆️  Back to top](#toc)

#### `fromAsyncThrowable`

Top level export of `ResultAsync.fromSafePromise`.
Please find documentation at [ResultAsync.fromThrowable](#resultasyncfromthrowable-static-class-method)

[⬆️  Back to top](#toc)

#### `fromPromise`

Top level export of `ResultAsync.fromPromise`.
Please find documentation at [ResultAsync.fromPromise](#resultasyncfrompromise-static-class-method)

[⬆️  Back to top](#toc)

#### `fromSafePromise`

Top level export of `ResultAsync.fromSafePromise`.
Please find documentation at [ResultAsync.fromSafePromise](#resultasyncfromsafepromise-static-class-method)

[⬆️  Back to top](#toc)

#### `safeTry`

Used to implicitly return errors and reduce boilerplate.

Let's say we are writing a function that returns a `Result`, and in that function we call some functions which also return `Result`s and we check those results to see whether we should keep going or abort. Usually, we will write like the following.
```typescript
declare function mayFail1(): Result<number, string>;
declare function mayFail2(): Result<number, string>;

function myFunc(): Result<number, string> {
    // We have to define a constant to hold the result to check and unwrap its value.
    const result1 = mayFail1();
    if (result1.isErr()) {
        return err(`aborted by an error from 1st function, ${result1.error}`);
    }
    const value1 = result1.value

    // Again, we need to define a constant and then check and unwrap.
    const result2 = mayFail2();
    if (result2.isErr()) {
        return err(`aborted by an error from 2nd function, ${result2.error}`);
    }
    const value2 = result2.value

    // And finally we return what we want to calculate
    return ok(value1 + value2);
}
```
Basically, we need to define a constant for each result to check whether it's a `Ok` and read its `.value` or `.error`.

With safeTry, we can state 'Return here if its an `Err`, otherwise unwrap it here and keep going.' in just one expression.
```typescript
declare function mayFail1(): Result<number, string>;
declare function mayFail2(): Result<number, string>;

function myFunc(): Result<number, string> {
    return safeTry<number, string>(function*() {
        return ok(
            // If the result of mayFail1().mapErr() is an `Err`, the evaluation is
            // aborted here and the enclosing `safeTry` block is evaluated to that `Err`.
            // Otherwise, this `(yield* ...)` is evaluated to its `.value`.
            (yield* mayFail1()
                .mapErr(e => `aborted by an error from 1st function, ${e}`)
                .safeUnwrap())
            +
            // The same as above.
            (yield* mayFail2()
                .mapErr(e => `aborted by an error from 2nd function, ${e}`)
                .safeUnwrap())
        )
    })
}
```

To use `safeTry`, the points are as follows.
* Wrap the entire block in a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
* In that block, you can use `yield* <RESULT>` to state 'Return `<RESULT>` if it's an `Err`, otherwise evaluate to its `.value`'
* Pass the generator function to `safeTry`

You can also use [async generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function*) to pass an async block to `safeTry`.
```typescript
// You can use either Promise<Result> or ResultAsync.
declare function mayFail1(): Promise<Result<number, string>>;
declare function mayFail2(): ResultAsync<number, string>;

function myFunc(): Promise<Result<number, string>> {
    return safeTry<number, string>(async function*() {
        return ok(
            // You have to await if the expression is Promise<Result>
            (yield* (await mayFail1())
                .mapErr(e => `aborted by an error from 1st function, ${e}`)
                .safeUnwrap())
            +
            // You can call `safeUnwrap` directly if its ResultAsync
            (yield* mayFail2()
                .mapErr(e => `aborted by an error from 2nd function, ${e}`)
                .safeUnwrap())
        )
    })
}
```

For more information, see https://github.com/supermacro/neverthrow/pull/448 and https://github.com/supermacro/neverthrow/issues/444

[⬆️  Back to top](#toc)

---

### Testing

`Result` instances have two unsafe methods, aptly called `_unsafeUnwrap` and `_unsafeUnwrapErr` which **should only be used in a test environment**.

`_unsafeUnwrap` takes a `Result<T, E>` and returns a `T` when the result is an `Ok`, otherwise it throws a custom object.

`_unsafeUnwrapErr` takes a `Result<T, E>` and returns a `E` when the result is an `Err`, otherwise it throws a custom object.

That way you can do something like:

```typescript
expect(myResult._unsafeUnwrap()).toBe(someExpectation)
```

However, do note that `Result` instances are comparable. So you don't necessarily need to unwrap them in order to assert expectations in your tests. So you could also do something like this:

```typescript
import { ok } from 'neverthrow'

// ...

expect(callSomeFunctionThatReturnsAResult("with", "some", "args")).toEqual(ok(someExpectation));
```

By default, the thrown value does not contain a stack trace. This is because stack trace generation [makes error messages in Jest harder to understand](https://github.com/supermacro/neverthrow/pull/215). If you want stack traces to be generated, call `_unsafeUnwrap` and / or `_unsafeUnwrapErr` with a config object:

```typescript
_unsafeUnwrapErr({
  withStackTrace: true,
})

// ^ Now the error object will have a `.stack` property containing the current stack
```

---

If you find this package useful, please consider [sponsoring me](https://github.com/sponsors/supermacro/) or simply [buying me a coffee](https://ko-fi.com/gdelgado)!

---

## A note on the Package Name

Although the package is called `neverthrow`, please don't take this literally. I am simply encouraging the developer to think a bit more about the ergonomics and usage of whatever software they are writing.

`Throw`ing and `catching` is very similar to using `goto` statements - in other words; it makes reasoning about your programs harder. Secondly, by using `throw` you make the assumption that the caller of your function is implementing `catch`. This is a known source of errors. Example: One dev `throw`s and another dev uses the function without prior knowledge that the function will throw. Thus, and edge case has been left unhandled and now you have unhappy users, bosses, cats, etc.

With all that said, there are definitely good use cases for throwing in your program. But much less than you might think.

### License

The neverthrow project is available as open source under the terms of the [MIT license](https://github.com/supermacro/neverthrow/blob/master/LICENSE).
