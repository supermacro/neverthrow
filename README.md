
# NeverThrow

## Description

Encode failure into your program.

This program contains a Result type that represents either success (Ok) or failure (Err).

This package works for both JS and TypeScript. However, the types that this package provides will allow you to get compile-time guarantees around error handling if you are using TypeScript.

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

> more documentation coming soon :) ... the source code + tests are pretty self-explanatory though!


## A note on the Package Name

Although the package is called `neverthrow`, please don't take this literally. I am simply encouraging the developer to think a bit more about the ergonomics and usage of whatever software they are writing.

`Throw`ing and `catching` is very similar to using `goto` statements - in other words; it makes reasoning about your programs harder. Secondly, by using `throw` you make the assumption that the caller of your function is implementing `catch`. This is a known source of errors. Example: One dev `throw`s and another dev uses the function without prior knowledge that the function will throw. Thus, and edge case has been left unhandled and now you have unhappy users, bosses, cats, etc.

With all that said, there are definitely good use cases for throwing in your program. But much less than you might think.
