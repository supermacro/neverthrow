# NeverThrow 🙅

[![Build Status](https://travis-ci.com/supermacro/neverthrow.svg?branch=master)](https://travis-ci.com/supermacro/neverthrow)

## Description

Encode failure into your program.

This package contains a `Result` type that represents either success (`Ok`) or failure (`Err`).

For asynchronous tasks, `neverthrow` offers a `ResultAsync` class which wraps a `Promise<Result>` and enables chaining.  
`ResultAsync` is `thenable` meaning it behaves exactly like a native `Promise<Result>`: the underlying `Result` can be accessed using the `await` or `.then()` operators.

`neverthrow` also exposes `chain(...)` methods for chaining asynchronous tasks in a functional style ([docs below](#chaining-api)). However, these methods might be deprecated in the future. It is advised to use the `ResultAsync` instead.

[Read the blog post](https://gdelgado.ca/type-safe-error-handling-in-typescript.html#title) which explains _why you'd want to use this package_.

This package works for both JS and TypeScript. However, the types that this package provides will allow you to get compile-time guarantees around error handling if you are using TypeScript.

`neverthrow` draws inspiration from [Rust](https://doc.rust-lang.org/std/result/enum.Result.html), and [Elm](https://package.elm-lang.org/packages/elm/core/latest/Result). It is also a great companion to [fp-ts](https://gcanti.github.io/fp-ts/).

> Need to see real-life examples of how to leverage this package for error handling? See this repo: https://github.com/parlez-vous/server

## Installation

```sh
> npm install neverthrow
```

## Usage

### Synchronous API

Create `Ok` or `Err` instances with the `ok` and `err` functions.

```typescript
import { ok, err } from 'neverthrow'

// something awesome happend

const yesss = ok(someAesomeValue)

// moments later ...

const mappedYes = yesss.map(doingSuperUsefulStuff)

// neverthrow uses type-guards to differentiate between Ok and Err instances
// Mode info: https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types
if (mappedYes.isOk()) {
  // using type guards, we can access an Ok instance's `value` field
  doStuffWith(mappedYes.value)
} else {
  // because of type guards
  // typescript knows that mappedYes is an Err instance and thus has a `error` field
  doStuffWith(mappedYes.error)
}
```

`Result` is defined as follows:

```typescript
type Result<T, E> = Ok<T, E> | Err<T, E>
```

`Ok<T, E>`: contains the success value of type `T`

`Err<T, E>`: contains the failure value of type `E`

---

### Asynchronous API

Asynchronous methods can return a `ResultAsync` type instead of a `Promise<Result>` in order to enable further chaining.

`ResultAsync` is `thenable` meaning it behaves exactly like a native `Promise<Result>`: the underlying `Result` can be accessed using the `await` or `.then()` operators.

This is useful for handling multiple asynchronous apis like database queries, timers, http requests, ...

Example:

```typescript
import { errAsync, ResultAsync } from 'neverthrow'
import { insertIntoDb } from 'imaginary-database'
// Let's assume insertIntoDb has the following signature:
// insertIntoDb(user: User): Promise<User>

// We can create a synchronous method that returns a ResultAsync
function addUserToDatabase(user: User): ResultAsync<User, Error> {
  if (user.name.length < 3) {
    // Throw a async result from a synchronous block thanks to the errAsync helper
    return errAsync(new Error('Username is too short'))
  }

  // Wrap the async method into a ResultAsync thanks to fromPromise
  // The seconds argument catches the error from the promise
  return ResultAsync.fromPromise(insertIntoDb(user), () => new Error('Database error'))
}

// We can now call the method above
const asyncRes = addUserToDatabase({ name: 'Tom' }) // asyncRes is a `ResultAsync<User, Error>`

// We can chain the ResultAsync to build another ResultAsync (see full api below)
const asyncRes2 = asyncRes.map((user: User) => user.name) // asyncRes2 is a `ResultAsync<string, Error>`

// A ResultAsync acts exactly like a Promise<Result>
// It can be transformed back into a Result just like a Promise would:

// using await
const res = await asyncRes
// res is a Result<string, Error>
if (res.isErr()) {
  console.log('Oops fail: ' + res.error.message)
} else {
  console.log('Successfully inserted user ' + res.value)
}

// using then
asyncRes.then(res => {
  // res is Result<string, Error>
  if (res.isErr()) {
    console.log('Oops fail: ' + res.error.message)
  } else {
    console.log('Successfully inserted user ' + res.value)
  }
})
```

## Top-Level API

`neverthrow` exposes the following:

- `ok` convenience function to create an `Ok` variant of `Result`
- `err` convenience function to create an `Err` variant of `Result`
- `Ok` class for you to construct an `Ok` variant in an OOP way using `new`
- `Err` class for you to construct an `Err` variant in an OOP way using `new`
- `Result` type - only available in TypeScript
- `ResultAsync` class
- `okAsync` convenience function to create a `ResultAsync` containing an `Ok` type `Result`
- `errAsync` convenience function to create a `ResultAsync` containing an `Err` type `Result`
- `chain` and all of its variants ([docs below](#chaining-api)) - for chaining sequential asynchronous operations that return `Result`s

```typescript
import { ok, Ok, err, Err, Result } from 'neverthrow'

// chain api available as well
import { chain, chain3, chain4, chain5, chain6, chain7, chain8 } from 'neverthrow'
```

## Accessing the value inside of a Result

This library takes advantage of TypeScript's [type-guard feature](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types).

By simply doing an `if` (using `.isOk` or `.isErr`) check on your result, you can inform the TypeScript compiler of whether you have `Ok` instance, or an `Err` instance, and subsequently you can get access to the `value` or `error` value in the respective instances.

Example:

```typescript
import { ok, err } from 'neverthrow'

const example1 = ok(123)
const example2 = err('abc')

if (example1.isOk()) {
  // you now have access to example1.value
} else {
  // you now have access to example1.error
}

if (example2.isErr()) {
  // you now have access to example2.error
} else {
  // you now have access to example2.value
}
```

## API

### `ok`

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

---

### `err`

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

---

### `Result.isOk` (method)

Returns `true` if the result is an `Ok` variant

**Signature:**

```typescript
isOk():  boolean { ... }
```

---

### `Result.isErr` (method)

Returns `true` if the result is an `Err` variant

**Signature**:

```typescript
isErr():  boolean { ... }
```

---

### `Result.map` (method)

Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.

This function can be used to compose the results of two functions.

**Signature:**

```typescript
type MapFunc = <T>(f: T) => U
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

---

### `Result.mapErr` (method)

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

---

### `Result.unwrapOr` (method)

Unwrap the `Ok` value, or return the default if there is an `Err`

**Signature:**

```typescript
unwrapOr<T>(v: T):  T { ... }
```

**Example**:

```typescript
const myResult = err('Oh noooo')

const multiply = (val: number): number => val * 2

const unwrapped: number = myResult.map(multiply).unwrapOr(10)
```

---

### `Result.andThen` (method)

Same idea as `map` above. Except you must return a new `Result`.

The returned value will be a `Result`.

This is useful for when you need to do a subsequent computation using the inner `T` value, but that computation might fail.

`andThen` is really useful as a tool to flatten a `Result<Result<A, E2>, E1>` into a `Result<A, E2>` (see example below).

**Signature:**

```typescript

type AndThenFunc = (t:  T) => Result<U, E>
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

---

### `Result.asyncAndThen` (method)

Same idea as `andThen` above. Except you must return a new `ResultAsync`.

The returned value will be a `ResultAsync`.

**Signature:**

```typescript

type AndThenAsyncFunc = (t:  T) => ResultAsync<U, E>
asyncAndThen<U>(f: AndThenAsyncFunc): ResultAsync<U, E> { ... }

```

---

### `Result.match` (method)

Given 2 functions (one for the `Ok` variant and one for the `Err` variant) execute the function that matches the `Result` variant.

Match callbacks do not necessitate to return a `Result`, however you can return a `Result` if you want to.

**Signature:**

```typescript
match<A>(
  okFn: (t:  T) =>  A,
  errFn: (e:  E) =>  A
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

---

### `Result.asyncMap` (method)

Similar to `map` except for two things:

- the mapping function must return a `Promise`
- asyncMap returns a `ResultAsync`

You can then chain the result of `asyncMap` using the `ResultAsync` apis (like `map`, `mapErr`, `andThen`, etc.)

**Signature:**

```typescript
type MappingFunc = (t:  T) => Promise<U>
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

---

### `okAsync`

Constructs an `Ok` variant of `ResultAsync`

**Signature:**

```typescript
okAsync<T, E>(value:  T): ResultAsync<T, E>
```

**Example:**

```typescript
import { okAsync } from 'neverthrow'

const myResultAsync = okAsync({ myData: 'test' }) // instance of `ResultAsync`

const myResult = await myResultAsync // instance of `Ok`

myResult.isOk() // true
myResult.isErr() // false
```

---

### `errAsync`

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

---

### `ResultAsync.fromPromise` (method)

Transforms a `Promise<T>` into a `ResultAsync<T, E>`.

The second argument handles the rejection case of the promise. If it is ommited, **the code might throw** because `neverthrow` does not know if the promise you are passing to `fromPromise` has any promise rejection logic associated to it (via a `.catch` method call or `catch (err) {}` block).

**Signature:**

```typescript
fromPromise<U, E>(p: Promise<U>, f?: (e: unknown) => E):  ResultAsync<U, E> { ... }
```

**Example**:

```typescript
import { insertIntoDb } from 'imaginary-database'
// insertIntoDb(user: User): Promise<User>

const res = ResultAsync.fromPromise(insertIntoDb(myUser), () => new Error('Database error'))
// res has a type of ResultAsync<User, Error>
```

---

### `ResultAsync.map` (method)

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

---

### `ResultAsync.mapErr` (method)

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

---

### `ResultAsync.unwrapOr` (method)

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

---

### `ResultAsync.andThen` (method)

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

---

### `ResultAsync.match` (method)

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
        .match((user: User) => `User ${user.name} has been successfully created`,
        (e: Error) =>  `User could not be created because ${e.message}`)

// resultMessage is a string
```

---

# 🔗

## Chaining API

> Disclaimer: the preferred solution to chaining asynchronous tasks is `ResultAsync`.  
> The following method might be deprecated in the future.

tldr: `chain` is the `.andThen` equivalent for `Result`s wrapped inside of a `Promise`.

> Examples can be found in the [tests directory](https://github.com/gDelgado14/neverthrow/blob/master/tests/index.test.ts#L235)

The `chain` functions allow you to create sequential execution flows for asynchronous tasks in a very elegant way.

If you try to create sequential execution flows for, say 3 or more, async tasks using the `asyncMap` method, you will end up with nested code (hello callback hell) and a lot of manually unwrapping promises using `await`.

`chain` takes care of unwrapping `Promise`s for you.

**Chains have short-circuit behaviour**:

One of the properties of the `chain` api (thanks to the way `Result`s work), is that the chain returns early (or short circuits) once any computation returns a `Err` variant.

All `chain` functions require that:

- the **first** argument be a promise with `Result` inside it.
- the **last** argument be a function that returns a promise with `Result` inside it.

All arguments **in between** the first and the last do not need to be async! You'll see this in the function signatures of `chain3`, `chain4`, `chain5`, etc ...

Here's an example using `chain4` ([source](https://github.com/parlez-vous/server/blob/19e34464863b04ae41efccad610be6fa967d5833/src/routes/admins/sites/get-single.ts#L20)):

```typescript
import { ok, chain4 } from 'neverthrow'

// ...
chain4(
  sessionManager.getSessionUser(),
  ({ id }) => getSingleSite(id, siteId),
  fetchSiteWithComments,
  siteWithComments => Promise.resolve(ok(buildSite(siteWithComments))),
)
```

### `chain`

**Signature:**

```typescript
<T1, T2, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>>,
): Promise<Result<T2, E>> => { ... }
```

The above in plain english:

- given a computation `r1`
- evaluate `r2` with the `Ok` value of `r1` as r2`'s argument.
  - If `r1` ends up being an `Err` value, then do not evaluate `r2`, and instead return the `Err`

### `chain3`

**Signature:**

```typescript
<T1, T2, T3, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>>,
): Promise<Result<T3, E>> => { ... }
```

Same thing as `chain`, except now you have a middle computation which can be either synchronous or asynchronous.

### `chain4`

**Signature:**

```typescript
<T1, T2, T3, T4, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>> | Result<T3, E>,
  r4: (v: T3) => Promise<Result<T4, E>>,
): Promise<Result<T4, E>> => { ... }
```

Same thing as `chain`, except now you have 2 middle computations; any of which can be either synchronous or asynchronous.

### `chain5`

**Signature:**

```typescript
<T1, T2, T3, T4, T5, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>> | Result<T3, E>,
  r4: (v: T3) => Promise<Result<T4, E>> | Result<T4, E>,
  r5: (v: T4) => Promise<Result<T5, E>>,
): Promise<Result<T5, E>> => { ... }
```

Same thing as `chain`, except now you have 3 middle computations; any of which can be either synchronous or asynchronous.

### `chain6`

**Signature:**

```typescript
<T1, T2, T3, T4, T5, T6, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>> | Result<T3, E>,
  r4: (v: T3) => Promise<Result<T4, E>> | Result<T4, E>,
  r5: (v: T4) => Promise<Result<T5, E>> | Result<T5, E>,
  r6: (v: T5) => Promise<Result<T6, E>>,
): Promise<Result<T6, E>> => {
```

Same thing as `chain`, except now you have 4 middle computations; any of which can be either synchronous or asynchronous.

### `chain7`

**Signature:**

```typescript
<T1, T2, T3, T4, T5, T6, T7, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>> | Result<T3, E>,
  r4: (v: T3) => Promise<Result<T4, E>> | Result<T4, E>,
  r5: (v: T4) => Promise<Result<T5, E>> | Result<T5, E>,
  r6: (v: T5) => Promise<Result<T6, E>> | Result<T6, E>,
  r7: (v: T6) => Promise<Result<T7, E>>,
): Promise<Result<T7, E>> => { ... }
```

Same thing as `chain`, except now you have 5 middle computations; any of which can be either synchronous or asynchronous.

### `chain8`

**Signature:**

```typescript
<T1, T2, T3, T4, T5, T6, T7, T8, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>> | Result<T3, E>,
  r4: (v: T3) => Promise<Result<T4, E>> | Result<T4, E>,
  r5: (v: T4) => Promise<Result<T5, E>> | Result<T5, E>,
  r6: (v: T5) => Promise<Result<T6, E>> | Result<T6, E>,
  r7: (v: T6) => Promise<Result<T7, E>> | Result<T7, E>,
  r8: (v: T7) => Promise<Result<T8, E>>,
): Promise<Result<T8, E>> => { ... }
```

Same thing as `chain`, except now you have 5 middle computations; any of which can be either synchronous or asynchronous.

--

## Wrapping a Dependency that throws

> incomplete documenation ...
> Examples to come soon

- axios
- knex

## A note on the Package Name

Although the package is called `neverthrow`, please don't take this literally. I am simply encouraging the developer to think a bit more about the ergonomics and usage of whatever software they are writing.

`Throw`ing and `catching` is very similar to using `goto` statements - in other words; it makes reasoning about your programs harder. Secondly, by using `throw` you make the assumption that the caller of your function is implementing `catch`. This is a known source of errors. Example: One dev `throw`s and another dev uses the function without prior knowledge that the function will throw. Thus, and edge case has been left unhandled and now you have unhappy users, bosses, cats, etc.

With all that said, there are definitely good use cases for throwing in your program. But much less than you might think.
