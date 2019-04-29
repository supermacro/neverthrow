
# NeverThrow

## Description

Encode failure into your program.

This package contains a Result type that represents either success (Ok) or failure (Err).

This package works for both JS and TypeScript. However, the types that this package provides will allow you to get compile-time guarantees around error handling if you are using TypeScript.

`neverthrow` draws inspiration from [Rust](https://doc.rust-lang.org/std/result/enum.Result.html), and [Elm](https://package.elm-lang.org/packages/elm/core/latest/Result). It is also a great companion to [fp-ts](https://gcanti.github.io/fp-ts/).


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

```typescript
import { ok, Ok, err, Err, Result } from 'neverthrow
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

`andThen` is really useful as a tool to flatten a `Result<Result<A, E2>, E1>` into a `Result<A, E2` (see example below).

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

`match` is sort of like combining `map` and `mapErr`.



**Signature:**
```typescript
match<U, A>(
  okFn: (t:  T) =>  U,
  errFn: (e:  E) =>  A
):  U | A => { ... }
```


**Example:**

```typescript
const result = computationThatMightFail()

const matched = result.match(
  (innerOkValue) => { return 'Yey' },
  (innerErrValue) => { return 'OhNooo' }
)
```


---

### `Result.asyncMap` (method)

Similar to `map` except for two things:
- the mapping function must return a `Promise`
- asyncMap returns a `Promise`

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


## Wrapping a Dependency that throws

> incomplete documenation ... 
> Examples to come soon

- axios
- knex





## A note on the Package Name

Although the package is called `neverthrow`, please don't take this literally. I am simply encouraging the developer to think a bit more about the ergonomics and usage of whatever software they are writing.

`Throw`ing and `catching` is very similar to using `goto` statements - in other words; it makes reasoning about your programs harder. Secondly, by using `throw` you make the assumption that the caller of your function is implementing `catch`. This is a known source of errors. Example: One dev `throw`s and another dev uses the function without prior knowledge that the function will throw. Thus, and edge case has been left unhandled and now you have unhappy users, bosses, cats, etc.

With all that said, there are definitely good use cases for throwing in your program. But much less than you might think.
