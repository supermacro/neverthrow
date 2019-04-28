
# NeverThrow

## Description

Encode failure into your program.

This program contains a Result type that represents either success (Ok) or failure (Err).

This package works for both JS and TypeScript. However, the types that this package provides will allow you to get compile-time guarantees around error handling if you are using TypeScript.

## Installation

> npm install neverthrow


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

Although the package is called `neverthrow`, please don't take this literally. I am simply encouraging the developer to think a bit more about the ergonomics and usage of whatever software they are writing. `Throw`ing and `catching` is syntactic sugar for `goto` statements - in other words; it makes reasoning about your programs harder. 

With all that said, there are definitely good use cases for throwing in your program. But much less than you might think.
