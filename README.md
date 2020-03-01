
# NeverThrow 🙅

## Description

Encode failure into your program.

This package contains a `Result` type that represents either success (`Ok`) or failure (`Err`).

`neverthrow` also exposes an api for chaining sequential asynchronous tasks ([docs below](#chaining-api)).

[Read the blog post](https://gdelgado.ca/type-safe-error-handling-in-typescript.html#title) which explains *why you'd want to use this package*.


This package works for both JS and TypeScript. However, the types that this package provides will allow you to get compile-time guarantees around error handling if you are using TypeScript.

`neverthrow` draws inspiration from [Rust](https://doc.rust-lang.org/std/result/enum.Result.html), and [Elm](https://package.elm-lang.org/packages/elm/core/latest/Result). It is also a great companion to [fp-ts](https://gcanti.github.io/fp-ts/).


> Need to see real-life examples of how to leverage this package for error handling? See this repo: https://github.com/parlez-vous/server

## Installation

```sh
> npm install neverthrow
```





## Usage

Create `Ok` or `Err` instances with the `ok` and `err` functions.

```typescript
import { ok, err } from 'neverthrow'

// something awesome happend

const yesss = ok(someAesomeValue)

// moments later ...

const mappedYes = yesss.map(doingSuperUsefulStuff)
```


`Result` is defined as follows:

```typescript
type  Result<T, E>
  =  Ok<T, E>
  |  Err<T, E>
```

`Ok<T, E>`: contains the success value of type `T`

`Err<T, E>`: contains the failure value of type `E`

## Top-Level API

`neverthrow` exposes the following:

- `ok` convenience function to create an `Ok` variant of `Result`
- `err` convenience function to create an `Err` variant of `Result`
- `Ok` class for you to construct an `Ok` variant in an OOP way using `new`
- `Err` class for you to construct an `Err` variant in an OOP way using `new`
- `Result` type - only available in TypeScript
- `chain` and all of its variants ([docs below](#chaining-api)) - for chaining sequential asynchronous operations that return `Result`s

```typescript
import { ok, Ok, err, Err, Result } from 'neverthrow'

// chain api available as well
import {
  chain,
  chain3,
  chain4,
  chain5,
  chain6,
  chain7,
  chain8
} from 'neverthrow'
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

### `Result.andThen` (method)

Same idea as `map` above. Except you must return a new `Result`. 

This is useful for when you need to do a subsequent computation using the inner `T` value, but that computation might fail.

`andThen` is really useful as a tool to flatten a `Result<Result<A, E2>, E1>` into a `Result<A, E2>` (see example below).

**Signature:**
```typescript
type ExtendFunc = (t:  T) => Result<U, E>
extend<U>(f: ExtendFunc): Result<U, E> { ... }
```


**Example 1: Chaining Results**
```typescript
import { err, ok } from 'neverthrow'

const sq = (n: number): Result<number, number> => ok(n ** 2)

ok(2).andThen(sq).andThen(sq) // Ok(16)

ok(2).andThen(sq).andThen(err) // Err(4)

ok(2).andThen(err).andThen(sq) // Err(2)

err(3).andThen(sq).andThen(sq) // Err(3)
```


**Example 2: Flattening Nested Results**

```typescript
// It's common to have nested Results
const nested = ok(ok(1234))

// notNested is a Ok(1234)
const notNested = nested.andThen(innerResult => innerResult)
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
result
  .map(successCallback)
  .mapErr(failureCallback)


// match api
// works exactly the same as above,
// except, now you HAVE to do error handling :)
myval.match(
  successCallback,
  failureCallback
)
```


---

### `Result.asyncMap` (method)

Similar to `map` except for two things:
- the mapping function must return a `Promise`
- asyncMap returns a `Promise`

**Check out the `chain` API**. If you need to chain multiple `Promise<Result>` type of computations together, `chain` is what you need. `asyncMap` is only suitable for doing a single async computation, not many sequential computations.

**Signature:**

```typescript
type MappingFunc = (t:  T) => Promise<U>
asyncMap<U>(fn: MappingFunc):  Promise<Result<U, E>> { ... }
```

**Example:**

```typescript
import { parseHeaders } 'imaginary-http-parser'
// imagine that parseHeaders has the following signature:
// parseHeaders(raw: string): Result<SomeKeyValueMap, ParseError>

const promise = parseHeaders(rawHeader)
  .map(headerKvMap => headerKvMap.Authorization)
  .asyncMap(findUserInDatabase)
```

Note that in the above example if `parseHeaders` returns an `Err` then `.map` and `.asyncMap` will not be invoked, and `promise` variable will contain a `Err` inside of the promise.


---


### `Result._unsafeUnwrap` (method)

Returns the inner `Ok` value.

Try to avoid unwrapping `Result`s, as it defeats the purpose of using `Result`s in the first place.

Ironically, this function will `throw` if the `Result` is an `Err`.

```typescript
import { ok } from 'neverthrow'

const result = ok(12)

const twelve = result._unsafeUnwrap()
```


### `Result._unsafeUnwrapErr` (method)

Returns the inner `Err` value.

Try to avoid unwrapping `Result`s, as it defeats the purpose of using `Result`s in the first place.

Ironically, this function will `throw` if the `Result` is an `Ok`.

```typescript
import { err } from 'neverthrow'

const result = err(12)

const twelve = result._unsafeUnwrapErr()
```


---
# 🔗
## Chaining API

> Examples can be found in the [tests directory](./tests/index.tests.ts)

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
    (siteWithComments) => Promise.resolve(
      ok(buildSite(siteWithComments))
    ),
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
