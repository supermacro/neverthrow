# NeverThrow 🙅

[![Build Status](https://travis-ci.com/supermacro/neverthrow.svg?branch=master)](https://travis-ci.com/supermacro/neverthrow)

[![Package Size](https://badgen.net/bundlephobia/minzip/neverthrow)](https://bundlephobia.com/result?p=neverthrow)


## Description

Encode failure into your program.

This package contains a `Result` type that represents either success (`Ok`) or failure (`Err`).

For asynchronous tasks, `neverthrow` offers a `ResultAsync` class which wraps a `Promise<Result<T, E>>` and gives you the same level of expressivity and control as a regular `Result<T, E>`.

`ResultAsync` is `thenable` meaning it **behaves exactly like a native `Promise<Result>`** ... except you have access to the same methods that `Result` provides without having to `await` or `.then` the promise! Check out [the wiki](https://github.com/supermacro/neverthrow/wiki/Basic-Usage-Examples#asynchronous-api) for examples and best practices.

> Need to see real-life examples of how to leverage this package for error handling? See this repo: https://github.com/parlez-vous/server

<div id="toc"></div>

## Table Of Contents

* [Installation](#installation)
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
    - [`Result.fromThrowable` (static class method)](#resultfromthrowable-static-class-method)
  + [Asynchronous API (`ResultAsync`)](#asynchronous-api-resultasync)
    - [`okAsync`](#okasync)
    - [`errAsync`](#errasync)
    - [`ResultAsync.fromPromise` (static class method)](#resultasyncfrompromise-static-class-method)
    - [`ResultAsync.map` (method)](#resultasyncmap-method)
    - [`ResultAsync.mapErr` (method)](#resultasyncmaperr-method)
    - [`ResultAsync.unwrapOr` (method)](#resultasyncunwrapor-method)
    - [`ResultAsync.andThen` (method)](#resultasyncandthen-method-1)
    - [`ResultAsync.match` (method)](#resultasyncmatch-method)
  + [Utilities](#utilities)
    - [`combine`](#combine)
  + [Testing](#testing)
* [A note on the Package Name](#a-note-on-the-package-name)

## Installation

```sh
> npm install neverthrow
```

## Top-Level API

`neverthrow` exposes the following:

- `ok` convenience function to create an `Ok` variant of `Result`
- `err` convenience function to create an `Err` variant of `Result`
- `Ok` class and type
- `Err` class and type
- `Result` Type as well as namespace / object from which to call [`Result.fromThrowable`](#resultfromthrowable-static-class-method)
- `ResultAsync` class
- `okAsync` convenience function to create a `ResultAsync` containing an `Ok` type `Result`
- `errAsync` convenience function to create a `ResultAsync` containing an `Err` type `Result`
- `combine` utility function that allows you to turn `Result<T, E>[]` into `Result<T[], E>`, or a `ResultAsync<T, E>[]` into `ResultAsync<T[], E>` (just like `Promise.all`)


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
  combine
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
ok<T, E>(value:  T): Ok<T, E> { ... }
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
err<T, E>(err:  E):  Err<T, E> { ... }
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
type MapFunc = <T, U>(f: T) => U
map<U>(fn: MapFunc):  Result<U, E> { ... }
```

**Example**:

```typescript
const { getLines } from 'imaginary-parser'
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
type MapFunc = <E>(e: E) => F
mapErr<U>(fn: MapFunc):  Result<T, F> { ... }
```

**Example**:

```typescript
import { parseHeaders } 'imaginary-http-parser'
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
unwrapOr<T>(v: T): T { ... }
```

**Example**:

```typescript
const myResult = err('Oh noooo')

const multiply = (val: number): number => val * 2

const unwrapped: number = myResult.map(multiply).unwrapOr(10)
```

[⬆️  Back to top](#toc)

---

#### `Result.andThen` (method)

Same idea as `map` above. Except you must return a new `Result`.

The returned value will be a `Result`.

This is useful for when you need to do a subsequent computation using the inner `T` value, but that computation might fail.

`andThen` is really useful as a tool to flatten a `Result<Result<A, E2>, E1>` into a `Result<A, E2>` (see example below).

**Signature:**

```typescript

type AndThenFunc = <T, U>(t:  T) => Result<U, E>
andThen<U>(f: AndThenFunc): Result<U, E> { ... }

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
const notNested = nested.andThen(innerResult => innerResult)
```

[⬆️  Back to top](#toc)

---

#### `Result.asyncAndThen` (method)

Same idea as `andThen` above. Except you must return a new `ResultAsync`.

The returned value will be a `ResultAsync`.

**Signature:**

```typescript

type AndThenAsyncFunc = (t:  T) => ResultAsync<U, E>
asyncAndThen<U>(f: AndThenAsyncFunc): ResultAsync<U, E> { ... }

```

[⬆️  Back to top](#toc)

---

#### `Result.orElse` (method)

Takes an `Err` value and maps it to a `Result<T, SomeNewType>`. This is useful for error recovery.

**Signature:**

```typescript
type ErrorCallback = <A>(e:  E) => Result<T, A>
orElse<A>(f: ErrorCallback<A>): Result<T, A> { ... }
```

**Example:**

```typescript
enum DatabaseError {
  PoolExhausted = 'PoolExhausted',
  NotFound = 'NotFound',
}

const dbQueryResult: Result<string, DatabaseError> = err(DatabaseError.NotFound)

const updatedQueryResult = dbQueryResult.orElse(dbError =>
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
match<A>(
  okFn: (t: T) =>  A,
  errFn: (e: E) =>  A
): A => { ... }
```

`match` is like chaining `map` and `mapErr`, with the distinction that with `match` both functions must have the same return type.

**Example:**

```typescript
const result = computationThatMightFail()

const successCallback = (someNumber: number) => {
  console.log('> number is: ', someNumber)
}

const failureCallback = (someFailureValue: string) => {
  console.log('> boooooo')
}

// method chaining api
// note that you DONT have to append mapErr
// after map which means that you are not required to do
// error handling
result.map(successCallback).mapErr(failureCallback)

// match api
// works exactly the same as above,
// except, now you HAVE to do error handling :)
myval.match(successCallback, failureCallback)
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
type MappingFunc = (t: T) => Promise<U>
asyncMap<U>(fn: MappingFunc):  ResultAsync<U, E> { ... }
```

**Example:**

```typescript
import { parseHeaders } 'imaginary-http-parser'
// imagine that parseHeaders has the following signature:
// parseHeaders(raw: string): Result<SomeKeyValueMap, ParseError>

const asyncRes = parseHeaders(rawHeader)
  .map(headerKvMap => headerKvMap.Authorization)
  .asyncMap(findUserInDatabase)
```

Note that in the above example if `parseHeaders` returns an `Err` then `.map` and `.asyncMap` will not be invoked, and `asyncRes` variable will resolve to an `Err` when turned into a `Result` using `await` or `.then()`.
  
[⬆️  Back to top](#toc)

---

#### `Result.fromThrowable` (static class method)

> Although Result is not an actual JS class, the way that `fromThrowable` has been implemented requires that you call `fromThrowable` as though it were a static method on `Result`. See examples below.

The JavaScript community has agreed on the convention of throwing exceptions.
As such, when interfacing with third party libraries it's imperative that you
wrap third-party code in try / catch  blocks.

This function will create a new function that returns an `Err` when the original
function throws.

It is not possible to know the types of the errors thrown in the original
function, therefore it is recommended to use the second argument `errorFn` to
map what is thrown to a known type.

**Example**:

```typescript
import { Result } from 'neverthrow'

type ParseError = { message: string }
const toParseError = (): ParseError => ({message: "Parse Error" })

const safeJsonParse = Result.fromThrowable(JSON.parse, toParseError)

// the function can now be used safely, if the function throws, the result will be an Err
const res = safeJsonParse("{");
```

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
errAsync<T, E>(err:  E):  ResultAsync<T, E>
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

#### `ResultAsync.fromPromise` (static class method)

Transforms a `Promise<T>` into a `ResultAsync<T, E>`.

The second argument handles the rejection case of the promise. If it is ommited, **the code might throw** because `neverthrow` does not know if the promise you are passing to `fromPromise` has any promise rejection logic associated to it (via a `.catch` method call or `catch (err) {}` block).

**Signature:**

```typescript
fromPromise<U, E>(p: Promise<U>, f?: (e: unknown) => E):  ResultAsync<U, E> { ... }
```

**Example**:

```typescript
import { ResultAsync } from 'neverthrow'
import { insertIntoDb } from 'imaginary-database'
// insertIntoDb(user: User): Promise<User>

const res = ResultAsync.fromPromise(insertIntoDb(myUser), () => new Error('Database error'))
// res has a type of ResultAsync<User, Error>
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.map` (method)

Maps a `ResultAsync<T, E>` to `ResultAsync<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.

The applied function can be synchronous or asynchronous (returning a `Promise<U>`) with no impact to the return type.

This function can be used to compose the results of two functions.

**Signature:**

```typescript
type MapFunc = <T>(f: T | Promise<T>) => U
map<U>(fn: MapFunc):  ResultAsync<U, E> { ... }
```

**Example**:

```typescript
const { findUsersIn } from 'imaginary-database'
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
type MapFunc = <E>(e: E) => F | Promise<F>
mapErr<U>(fn: MapFunc):  ResultAsync<T, F> { ... }
```

**Example**:

```typescript
const { findUsersIn } from 'imaginary-database'
// ^ assume findUsersIn has the following signature:
// findUsersIn(country: string): ResultAsync<Array<User>, Error>

// Let's say we need to low-level errors from findUsersIn to be more readable
const usersInCanada = findUsersIn("Canada").mapErr((e: Error) => {
  // The only error we want to pass to the user is "Unknown country"
  if(e.message === "Unknown country"){
    return e.message
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
unwrapOr<T>(v: T):  Promise<T> { ... }
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
type AndThenFunc = (t:  T) => ResultAsync<U, E> | Result<U, E>
andThen<U>(f: AndThenFunc): ResultAsync<U, E> { ... }
```

**Example**

```typescript

const { validateUser } from 'imaginary-validator'
const { insertUser } from 'imaginary-database'
const { sendNotification } from 'imaginary-service'

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
type ErrorCallback = <A>(e:  E) => Result<T, A> | ResultAsync<T, A>
orElse<A>(f: ErrorCallback<A>): ResultAsync<T, A> { ... }
```

[⬆️  Back to top](#toc)

---

#### `ResultAsync.match` (method)

Given 2 functions (one for the `Ok` variant and one for the `Err` variant) execute the function that matches the `ResultAsync` variant.

The difference with `Result.match` is that it always returns a `Promise` because of the asynchronous nature of the `ResultAsync`.

**Signature:**

```typescript
match<A>(
  okFn: (t:  T) =>  A,
  errFn: (e:  E) =>  A
): Promise<A> => { ... }
```

**Example:**

```typescript

const { validateUser } from 'imaginary-validator'
const { insertUser } from 'imaginary-database'

// ^ assume validateUser and insertUser have the following signatures:
// validateUser(user: User): Result<User, Error>
// insertUser(user): ResultAsync<User, Error>

// Handle both cases at the end of the chain using match
const resultMessage = await validateUser(user)
        .andThen(insertUser)
        .match(
            (user: User) => `User ${user.name} has been successfully created`,
            (e: Error) =>  `User could not be created because ${e.message}`
        )

// resultMessage is a string
```

[⬆️  Back to top](#toc)

---

### Utilities

#### `combine`

Combine lists of `Result`s or lists of `ResultAsync`s.

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

Additionally, this same function also works for `ResultAsync`. And thanks to typescript function overloading, the types can be distinguished.

```typescript
function combine<T, E>(asyncResultList: ResultAsync<T, E>[]): ResultAsync<T[], E>
```

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
