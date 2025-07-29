/*
 * Type Tests
 *
 * This file is ran during CI to ensure that there aren't breaking changes with types
 */

import {
  err,
  errAsync,
  fromSafePromise,
  ok,
  okAsync,
  Result,
  ResultAsync,
} from '../src'
import { safeTry, Transpose } from '../src/result'
import { type N, Test } from 'ts-toolbelt'

type CreateTuple<L, V = string> =
  // Length must always be a number
  L extends number
    ? N.IsNegative<L> extends 1
      // Length must always be non-negative
      ? never 
      // base case
      : L extends 0
        ? []
        // recursion depth check
        // typescript has a limit.
        : N.Lower<L, 50> extends 1
          ? [V, ...CreateTuple<N.Sub<L, 1>, V>] 
          : never
    : never;


(function describe(_ = 'Result') {
  (function describe(_ = 'andThen') {
    (function it(_ = 'Combines two equal error types (native scalar types)') {
      type Expectation = Result<unknown, string>

      const result: Expectation = ok<number, string>(123)
        .andThen((val) => err('yoooooo dude' + val))
    });

    (function it(_ = 'Combines two equal error types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = Result<string, MyError>

      const result: Expectation = ok<number, MyError>(123)
        .andThen((val) => err<string, MyError>({ stack: '/blah', code: 500 }))
    });

    (function it(_ = 'Creates a union of error types for disjoint types') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = Result<string, MyError | string[]>

      const result: Expectation = ok<number, MyError>(123)
        .andThen((val) => err<string, string[]>(['oh nooooo']))
    });

    (function it(_ = 'Infers error type when returning disjoint types (native scalar types)') {
      type Expectation = Result<unknown, string | number | boolean>

      const result: Expectation = ok<number, string>(123)
        .andThen((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return err(123)
            default:
              return err(false)
          }
        })
    });

    (function it(_ = 'Infers error type when returning disjoint types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }
      type Expectation = Result<unknown, string | number | MyError>

      const result: Expectation = ok<number, string>(123)
        .andThen((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return err(123)
            default:
              return err({ stack: '/blah', code: 500 })
          }
        })
    });

    (function it(_ = 'Infers new ok type when returning both Ok and Err (same as initial)') {
      type Expectation = Result<number, unknown>

      const result: Expectation = ok<number, string>(123)
        .andThen((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            default:
              return ok(val + 456)
          }
        })
    });

    (function it(_ = 'Infers new ok type when returning both Ok and Err (different from initial)') {
      const initial = ok<number, string>(123)
      type Expectation = Result<string, unknown>

      const result: Expectation = initial
        .andThen((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            default:
              return ok(val + ' string')
          }
        })
    });

    (function it(_ = 'Infers new err type when returning both Ok and Err') {
      interface MyError { 
        stack: string
        code: number
      }
      type Expectation = Result<unknown, string | number | MyError>
  
      const result: Expectation = ok<number, string>(123)
        .andThen((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return ok(123)
            default:
              return err({ stack: '/blah', code: 500 })
          }
        })
    });

    (function it(_ = 'allows specifying the E and T types explicitly') {
      type Expectation = Result<'yo', number>

      const result: Expectation = ok(123).andThen<'yo', number>(val => {
        return ok('yo')
      })
    });
  });

  (function describe(_ = 'andThrough') {
    (function it(_ = 'Combines two equal error types (native scalar types)') {
      type Expectation = Result<number, string>

      const result: Expectation = ok<number, string>(123)
        .andThrough((val) => err('yoooooo dude' + val))
    });

    (function it(_ = 'Combines two equal error types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = Result<number, MyError>

      const result: Expectation = ok<number, MyError>(123)
        .andThrough((val) => err<string, MyError>({ stack: '/blah', code: 500 }))
    });

    (function it(_ = 'Creates a union of error types for disjoint types') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = Result<number, MyError | string[]>

      const result: Expectation = ok<number, MyError>(123)
        .andThrough((val) => err<string, string[]>(['oh nooooo']))
    });

    (function it(_ = 'Infers error type when returning disjoint types (native scalar types)') {
      type Expectation = Result<number, string | number | boolean>

      const result: Expectation = ok<number, string>(123)
        .andThrough((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return err(123)
            default:
              return err(false)
          }
        })
    });

    (function it(_ = 'Infers error type when returning disjoint types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }
      type Expectation = Result<number, string | number | MyError>

      const result: Expectation = ok<number, string>(123)
        .andThrough((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return err(123)
            default:
              return err({ stack: '/blah', code: 500 })
          }
        })
    });

    (function it(_ = 'Returns the original ok type when returning both Ok and Err (same as initial)') {
      type Expectation = Result<number, unknown>

      const result: Expectation = ok<number, string>(123)
        .andThrough((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            default:
              return ok(val + 456)
          }
        })
    });

    (function it(_ = 'Returns the original ok type when returning both Ok and Err (different from initial)') {
      const initial = ok<number, string>(123)
      type Expectation = Result<number, unknown>

      const result: Expectation = initial
        .andThrough((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            default:
              return ok("Hi" + val)
          }
        })
    });

    (function it(_ = 'Infers new err type when returning both Ok and Err') {
      interface MyError { 
        stack: string
        code: number
      }
      type Expectation = Result<number, string | number | MyError>
  
      const result: Expectation = ok<number, string>(123)
        .andThrough((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return ok(123)
            default:
              return err({ stack: '/blah', code: 500 })
          }
        })
    });

    (function it(_ = 'allows specifying the E type explicitly') {
      type Expectation = Result<number, string>

      const result: Expectation = ok(123).andThrough<string>(val => {
        return ok('yo')
      })
    });
  });

  (function describe(_ = 'orElse') {
    (function it(_ = 'the type of the argument is the error type of the result') {
      type Expectation = string

      const result = ok<number, string>(123)
        .orElse((val: Expectation) => {
          switch (val) {
            case '2':
              return err(1)
            default:
              return err(1)
          }
        })
    });


    (function it(_ = 'infers the err return type with multiple returns (same type) ') {
      type Expectation = Result<number, number>

      const result: Expectation = ok<number, string>(123)
        .orElse((val) => {
          switch (val) {
            case '2':
              return err(1)
            default:
              return err(1)
          }
        })
    });

    (function it(_ = 'infers the err return type with multiple returns (different type) ') {
      type Expectation = Result<number, number | string>

      const result: Expectation = ok<number, string>(123)
        .orElse((val) => {
          switch (val) {
            case '2':
              return err(1)
            default:
              return err('1')
          }
        })
    });

    (function it(_ = 'infers ok and err return types with multiple returns ') {
      type Expectation = Result<number, number | string>

      const result: Expectation = ok<number, string>(123)
        .orElse((val) => {
          switch (val) {
            case '1':
              return ok(1)
            case '2':
              return err(1)
            default:
              return err('1')
          }
        })
    });

    (function it(_ = 'allows specifying the E and T types explicitly') {
      type Expectation = Result<'yo', string>

      const result: Expectation = ok<'yo', number>('yo').orElse<'yo', string>(val => {
        return err('yo')
      })
    });

    (function it(_ = 'Creates a union of ok types for disjoint types') {
      type Expectation = Result<string | number, boolean>

      const result: Expectation = err<string, boolean[]>([true])
          .orElse((val) => ok<string, boolean>('recovered!'))
    });

    (function it(_ = 'Infers ok type when returning disjoint types') {
      type Expectation = Result<string | number | boolean, unknown>

      const result: Expectation = err<string, number>(123)
          .orElse((val) => {
            switch (val) {
              case 1:
                return ok('yoooooo dude' + val)
              case 2:
                return ok(123)
              default:
                return ok(false)
            }
          })
    });

    (function it(_ = 'Infers new type when returning both Ok and Err') {
      const initial = err<string, number>(123)
      type Expectation = Result<string | true, false>

      const result: Expectation = initial
          .orElse((val) => {
            switch (val) {
              case 1:
                return err(false as const)
              default:
                return ok(true as const)
            }
          })
    });
  });

  (function describe(_ = 'match') {
    (function it(_ = 'the type of the arguments match the types of the result') {
      type OKExpectation = number
      type ErrExpectation = string

      ok<number, string>(123)
        .match(
          (val: OKExpectation): void => void val,
          (val: ErrExpectation): void => void val,
        );
      err<number, string>("123")
        .match(
          (val: OKExpectation): void => void val,
          (val: ErrExpectation): void => void val,
        );
    });

    (function it(_ = 'infers the resulting value from match callbacks (same type)') {
      type Expectation = boolean

      const okResult: Expectation = ok<number, string>(123)
        .match(
          (val) => !!val,
          (val) => !!val,
        );
      const errResult: Expectation = err<number, string>('123')
        .match(
          (val) => !!val,
          (val) => !!val,
        );
    });

    (function it(_ = 'infers the resulting value from match callbacks (different type)') {
      type Expectation = boolean | bigint

      const okResult: Expectation = ok<string, number>('123')
        .match(
          (val) => !!val,
          (val) => BigInt(val),
        );
      const errResult: Expectation = err<string, number>(123)
        .match(
          (val) => !!val,
          (val) => BigInt(val),
        );
    });
  });

  (function describe(_ = 'asyncAndThen') {
    (function it(_ = 'Combines two equal error types (native scalar types)') {
      type Expectation = ResultAsync<unknown, string>

      const result: Expectation = ok<number, string>(123)
        .asyncAndThen((val) => errAsync('yoooooo dude' + val))
    });

    (function it(_ = 'Combines two equal error types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = ResultAsync<string, MyError>

      const result: Expectation = ok<number, MyError>(123)
        .asyncAndThen((val) => errAsync<string, MyError>({ stack: '/blah', code: 500 }))
    });

    (function it(_ = 'Creates a union of error types for disjoint types') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = ResultAsync<string, MyError | string[]>

      const result: Expectation = ok<number, MyError>(123)
        .asyncAndThen((val) => errAsync<string, string[]>(['oh nooooo']))
    });
  });

  (function describe(_ = 'asyncAndThrough') {
    (function it(_ = 'Combines two equal error types (native scalar types)') {
      type Expectation = ResultAsync<unknown, string>

      const result: Expectation = ok<number, string>(123)
        .asyncAndThrough((val) => errAsync('yoooooo dude' + val))
    });

    (function it(_ = 'Combines two equal error types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = ResultAsync<number, MyError>

      const result: Expectation = ok<number, MyError>(123)
        .asyncAndThrough((val) => errAsync<string, MyError>({ stack: '/blah', code: 500 }))
    });

    (function it(_ = 'Creates a union of error types for disjoint types') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = ResultAsync<number, MyError | string[]>

      const result: Expectation = ok<number, MyError>(123)
        .asyncAndThrough((val) => errAsync<string, string[]>(['oh nooooo']))
    });

    (function it(_ = 'Infers error type when returning disjoint types (native scalar types)') {
      type Expectation = ResultAsync<number, string | number | boolean>

      const result: Expectation = ok<number, string>(123)
        .asyncAndThrough((val) => {
          switch (val) {
            case 1:
              return errAsync('yoooooo dude' + val)
            case 2:
              return errAsync(123)
            default:
              return errAsync(false)
          }
        })
    });

    (function it(_ = 'Infers error type when returning disjoint types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }
      type Expectation = Result<number, string | number | MyError>

      const result: Expectation = ok<number, string>(123)
        .andThrough((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return err(123)
            default:
              return err({ stack: '/blah', code: 500 })
          }
        })
    });

    (function it(_ = 'Returns the original ok type when returning both Ok and Err (same as initial)') {
      type Expectation = Result<number, unknown>

      const result: Expectation = ok<number, string>(123)
        .andThrough((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            default:
              return ok(val + 456)
          }
        })
    });

    (function it(_ = 'Returns the original ok type when returning both Ok and Err (different from initial)') {
      const initial = ok<number, string>(123)
      type Expectation = Result<number, unknown>

      const result: Expectation = initial
        .andThrough((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            default:
              return ok("Hi" + val)
          }
        })
    });

    (function it(_ = 'Infers new err type when returning both Ok and Err') {
      interface MyError { 
        stack: string
        code: number
      }
      type Expectation = Result<number, string | number | MyError>
  
      const result: Expectation = ok<number, string>(123)
        .andThrough((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return ok(123)
            default:
              return err({ stack: '/blah', code: 500 })
          }
        })
    });

    (function it(_ = 'allows specifying the E type explicitly') {
      type Expectation = Result<number, string>

      const result: Expectation = ok(123).andThrough<string>(val => {
        return ok('yo')
      })
    });


    (function it(_ = 'Infers new err type when returning both Ok and Err') {
      interface MyError { 
        stack: string
        code: number
      }
      type Expectation = ResultAsync<number, string | number | MyError>
  
      const result: Expectation = ok<number, string>(123)
        .asyncAndThrough((val) => {
          switch (val) {
            case 1:
              return errAsync('yoooooo dude' + val)
            case 2:
              return okAsync(123)
            default:
              return errAsync({ stack: '/blah', code: 500 })
          }
        })
    });


  });

  (function describe(_ = 'combine') {
    (function it(_ = 'combines different results into one') {
      type Expectation = Result<[ number, string, boolean, boolean ], Error | string | string[]>;

      const result = Result.combine([
        ok<number, string>(1),
        ok<string, string>('string'),
        err<boolean, string[]>([ 'string', 'string2' ]),
        err<boolean, Error>(new Error('error content')),
      ])

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines only ok results into one') {
      type Expectation = Result<[ number, string ], never>;

      const result = Result.combine([
        ok(1),
        ok('string'),
      ]);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines only err results into one') {
      type Expectation = Result<[ never, never ], number | 'abc'>;

      const result = Result.combine([
        err(1),
        err('abc'),
      ]);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines empty list results into one') {
      type Expectation = Result<never, never>;
      const results: [] = [];

      const result = Result.combine(results);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines arrays of results to a result of an array') {
      type Expectation = Result<string[], string>;
      const results: Result<string, string>[] = [];

      const result = Result.combine(results);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function describe(_ = 'inference on large tuples') {
      (function it(_ = 'Should correctly infer the type on tuples with 6 elements') {
        type Input = CreateTuple<6, Result<string, never>>
        type Expectation = Result<CreateTuple<6, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 7 elements') {
        type Input = CreateTuple<7, Result<string, never>>
        type Expectation = Result<CreateTuple<7, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 8 elements') {
        type Input = CreateTuple<8, Result<string, never>>
        type Expectation = Result<CreateTuple<8, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 9 elements') {
        type Input = CreateTuple<9, Result<string, never>>
        type Expectation = Result<CreateTuple<9, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 10 elements') {
        type Input = CreateTuple<10, Result<string, never>>
        type Expectation = Result<CreateTuple<10, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 11 elements') {
        type Input = CreateTuple<11, Result<string, never>>
        type Expectation = Result<CreateTuple<11, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 12 elements') {
        type Input = CreateTuple<12, Result<string, never>>
        type Expectation = Result<CreateTuple<12, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 13 elements') {
        type Input = CreateTuple<13, Result<string, never>>
        type Expectation = Result<CreateTuple<13, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 14 elements') {
        type Input = CreateTuple<14, Result<string, never>>
        type Expectation = Result<CreateTuple<14, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 15 elements') {
        type Input = CreateTuple<15, Result<string, never>>
        type Expectation = Result<CreateTuple<15, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 16 elements') {
        type Input = CreateTuple<16, Result<string, never>>
        type Expectation = Result<CreateTuple<16, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 17 elements') {
        type Input = CreateTuple<17, Result<string, never>>
        type Expectation = Result<CreateTuple<17, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 18 elements') {
        type Input = CreateTuple<18, Result<string, never>>
        type Expectation = Result<CreateTuple<18, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 19 elements') {
        type Input = CreateTuple<19, Result<string, never>>
        type Expectation = Result<CreateTuple<19, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 20 elements') {
        type Input = CreateTuple<20, Result<string, never>>
        type Expectation = Result<CreateTuple<20, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 21 elements') {
        type Input = CreateTuple<21, Result<string, never>>
        type Expectation = Result<CreateTuple<21, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 22 elements') {
        type Input = CreateTuple<22, Result<string, never>>
        type Expectation = Result<CreateTuple<22, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 23 elements') {
        type Input = CreateTuple<23, Result<string, never>>
        type Expectation = Result<CreateTuple<23, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 24 elements') {
        type Input = CreateTuple<24, Result<string, never>>
        type Expectation = Result<CreateTuple<24, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 25 elements') {
        type Input = CreateTuple<25, Result<string, never>>
        type Expectation = Result<CreateTuple<25, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 26 elements') {
        type Input = CreateTuple<26, Result<string, never>>
        type Expectation = Result<CreateTuple<26, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 27 elements') {
        type Input = CreateTuple<27, Result<string, never>>
        type Expectation = Result<CreateTuple<27, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 28 elements') {
        type Input = CreateTuple<28, Result<string, never>>
        type Expectation = Result<CreateTuple<28, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 29 elements') {
        type Input = CreateTuple<29, Result<string, never>>
        type Expectation = Result<CreateTuple<29, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 30 elements') {
        type Input = CreateTuple<30, Result<string, never>>
        type Expectation = Result<CreateTuple<30, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 31 elements') {
        type Input = CreateTuple<31, Result<string, never>>
        type Expectation = Result<CreateTuple<31, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 32 elements') {
        type Input = CreateTuple<32, Result<string, never>>
        type Expectation = Result<CreateTuple<32, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 33 elements') {
        type Input = CreateTuple<33, Result<string, never>>
        type Expectation = Result<CreateTuple<33, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 34 elements') {
        type Input = CreateTuple<34, Result<string, never>>
        type Expectation = Result<CreateTuple<34, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 35 elements') {
        type Input = CreateTuple<35, Result<string, never>>
        type Expectation = Result<CreateTuple<35, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 36 elements') {
        type Input = CreateTuple<36, Result<string, never>>
        type Expectation = Result<CreateTuple<36, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 37 elements') {
        type Input = CreateTuple<37, Result<string, never>>
        type Expectation = Result<CreateTuple<37, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 38 elements') {
        type Input = CreateTuple<38, Result<string, never>>
        type Expectation = Result<CreateTuple<38, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 39 elements') {
        type Input = CreateTuple<39, Result<string, never>>
        type Expectation = Result<CreateTuple<39, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 40 elements') {
        type Input = CreateTuple<40, Result<string, never>>
        type Expectation = Result<CreateTuple<40, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 41 elements') {
        type Input = CreateTuple<41, Result<string, never>>
        type Expectation = Result<CreateTuple<41, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 42 elements') {
        type Input = CreateTuple<42, Result<string, never>>
        type Expectation = Result<CreateTuple<42, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 43 elements') {
        type Input = CreateTuple<43, Result<string, never>>
        type Expectation = Result<CreateTuple<43, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 44 elements') {
        type Input = CreateTuple<44, Result<string, never>>
        type Expectation = Result<CreateTuple<44, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 45 elements') {
        type Input = CreateTuple<45, Result<string, never>>
        type Expectation = Result<CreateTuple<45, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 46 elements') {
        type Input = CreateTuple<46, Result<string, never>>
        type Expectation = Result<CreateTuple<46, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 47 elements') {
        type Input = CreateTuple<47, Result<string, never>>
        type Expectation = Result<CreateTuple<47, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 48 elements') {
        type Input = CreateTuple<48, Result<string, never>>
        type Expectation = Result<CreateTuple<48, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 49 elements') {
        type Input = CreateTuple<49, Result<string, never>>
        type Expectation = Result<CreateTuple<49, string>, never>

        const inputValues = input<Input>()
        const result = Result.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });
    });
  });

  (function describe(_ = 'combineWithAllErrors') {
    (function it(_ = 'combines different results into one') {
      type Expectation = Result<[ number, string, never, never ], (string[] | Error)[]>;

      const result = Result.combineWithAllErrors([
        ok(1),
        ok('string'),
        err([ 'string', 'string2' ]),
        err(new Error('error content')),
      ]);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines only ok results into one') {
      type Expectation = Result<[ number, string ], never[]>;

      const result = Result.combineWithAllErrors([
        ok(1),
        ok('string'),
      ]);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines only err results into one') {
      type Expectation = Result<[ never, never ], (number | 'string')[]>;

      const result = Result.combineWithAllErrors([
        err(1),
        err('string'),
      ]);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines arrays of results to a result of an array') {
      type Expectation = Result<string[], (number | string)[]>;
      const results: Result<string, number | string>[] = [];

      const result = Result.combineWithAllErrors(results);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines arrays of different results to a result of an array') {
      type Expectation = Result<(string | boolean)[], (number | string)[]>;
      const results: (Result<string, number> | Result<boolean, string>)[] = [];

      const result = Result.combineWithAllErrors(results);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function describe(_ = 'inference on large tuples') {
      (function it(_ = 'Should correctly infer the type on tuples with 6 elements') {
        type Input = CreateTuple<6, Result<string, number>>
        type Expectation = Result<CreateTuple<6, string>, number[]>

        const inputValues = input<Input>()
        const result = Result.combineWithAllErrors(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 15 elements') {
        type Input = CreateTuple<15, Result<string, number>>
        type Expectation = Result<CreateTuple<15, string>, number[]>

        const inputValues = input<Input>()
        const result = Result.combineWithAllErrors(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 30 elements') {
        type Input = CreateTuple<30, Result<string, number>>
        type Expectation = Result<CreateTuple<30, string>, number[]>

        const inputValues = input<Input>()
        const result = Result.combineWithAllErrors(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 49 elements') {
        type Input = CreateTuple<49 , Result<string, number>>
        type Expectation = Result<CreateTuple<49, string>, number[]>

        const inputValues = input<Input>()
        const result = Result.combineWithAllErrors(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });
    });
  });

  (function describe(_ = 'err') {
    (function it(_ = 'infers the error type narrowly when it is a string') {
      type Expectation = Result<never, 'error'>

      const result = err('error')

      const assignableToCheck: Expectation = result;
    });

    (function it(_ = 'infers the error type widely when it is not a string') {
      type Expectation = Result<never, { abc: number }>

      const result = err({ abc: 123 })

      const assignableToCheck: Expectation = result;
    });
  })
});


(function describe(_ = 'ResultAsync') {
  (function describe(_ = 'andThen') {
    (function it(_ = 'Combines two equal error types (native scalar types)') {
      type Expectation = ResultAsync<unknown, string>

      const result: Expectation = okAsync<number, string>(123)
        .andThen((val) => err('yoooooo dude' + val))
    });

    (function it(_ = 'Combines two equal error types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = ResultAsync<string, MyError>

      const result: Expectation = okAsync<number, MyError>(123)
        .andThen((val) => err<string, MyError>({ stack: '/blah', code: 500 }))
    });

    (function it(_ = 'Creates a union of error types for disjoint types') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = ResultAsync<string, MyError | string[]>

      const result: Expectation = okAsync<number, MyError>(123)
        .andThen((val) => err<string, string[]>(['oh nooooo']))
    });

    (function describe(_ = 'when returning Result types') {
      (function it(_ = 'Infers error type when returning disjoint types (native scalar types)') {
        type Expectation = ResultAsync<unknown, string | number | boolean>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return err('yoooooo dude' + val)
              case 2:
                return err(123)
              default:
                return err(false)
            }
          })
      });
  
      (function it(_ = 'Infers error type when returning disjoint types (custom types)') {
        interface MyError { 
          stack: string
          code: number
        }
        type Expectation = ResultAsync<unknown, string | number | MyError>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return err('yoooooo dude' + val)
              case 2:
                return err(123)
              default:
                return err({ stack: '/blah', code: 500 })
            }
          })
      });
  
      (function it(_ = 'Infers new ok type when returning both Ok and Err (same as initial)') {
        type Expectation = ResultAsync<number, unknown>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return err('yoooooo dude' + val)
              default:
                return ok(val + 456)
            }
          })
      });
  
      (function it(_ = 'Infers new ok type when returning both Ok and Err (different from initial)') {
        const initial = okAsync<number, string>(123)
        type Expectation = ResultAsync<string, unknown>
  
        const result: Expectation = initial
          .andThen((val) => {
            switch (val) {
              case 1:
                return err('yoooooo dude' + val)
              default:
                return ok(val + ' string')
            }
          })
      });
  
      (function it(_ = 'Infers new err type when returning both Ok and Err') {
        interface MyError { 
          stack: string
          code: number
        }
        type Expectation = ResultAsync<unknown, string | number | MyError>
    
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return err('yoooooo dude' + val)
              case 2:
                return ok(123)
              default:
                return err({ stack: '/blah', code: 500 })
            }
          })
      });
    });

    (function describe(_ = 'when returning ResultAsync types') {
      (function it(_ = 'Infers error type when returning disjoint types (native scalar types)') {
        type Expectation = ResultAsync<unknown, string | number | boolean>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              case 2:
                return errAsync(123)
              default:
                return errAsync(false)
            }
          })
      });
  
      (function it(_ = 'Infers error type when returning disjoint types (custom types)') {
        interface MyError { 
          stack: string
          code: number
        }
        type Expectation = ResultAsync<unknown, string | number | MyError>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              case 2:
                return errAsync(123)
              default:
                return errAsync({ stack: '/blah', code: 500 })
            }
          })
      });
  
      (function it(_ = 'Infers new ok type when returning both Ok and Err (same as initial)') {
        type Expectation = ResultAsync<number, unknown>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              default:
                return okAsync(val + 456)
            }
          })
      });
  
      (function it(_ = 'Infers new ok type when returning both Ok and Err (different from initial)') {
        const initial = okAsync<number, string>(123)
        type Expectation = ResultAsync<string, unknown>
  
        const result: Expectation = initial
          .andThen((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              default:
                return okAsync(val + ' string')
            }
          })
      });
  
      (function it(_ = 'Infers new err type when returning both Ok and Err') {
        interface MyError { 
          stack: string
          code: number
        }
        type Expectation = ResultAsync<unknown, string | number | MyError>
    
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              case 2:
                return okAsync(123)
              default:
                return errAsync({ stack: '/blah', code: 500 })
            }
          })
      });
    });

    (function describe(_ = 'when returning a mix of Result and ResultAsync types') {
      (function it(_ = 'allows for explicitly specifying the Ok and Err types when inference fails') {
        type Expectation = ResultAsync<number | boolean, string | number | boolean>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen<number | boolean, string | number | boolean>((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              case 2:
                return err(123)
              default:
                return okAsync(false)
            }
          })
      });
    });

    (function describe(_ = 'fromSafePromise') {
      (function it(_ = 'infers err type from usage') {
        type Expectation = ResultAsync<number, 'impossible error'>

        const result: Expectation = fromSafePromise(new Promise<number>((resolve) => resolve(123)))
          .map((val) => val)
      });
    });
  });

  (function describe(_ = 'orElse') {
    (function it(_ = 'the type of the argument is the error type of the result') {
      type Expectation = string

      const result = okAsync<number, string>(123)
        .orElse((val: Expectation) => {
          switch (val) {
            case '2':
              return errAsync(1)
            default:
              return errAsync(1)
          }
        })
    });


    (function it(_ = 'infers the err return type with multiple returns (same type) ') {
      type Expectation = ResultAsync<number, number>

      const result: Expectation = okAsync<number, string>(123)
        .orElse((val) => {
          switch (val) {
            case '2':
              return errAsync(1)
            default:
              return errAsync(1)
          }
        })
    });

    (function it(_ = 'infers the err return type with multiple returns (different type) ') {
      type Expectation = ResultAsync<number, number | string>

      const result: Expectation = okAsync<number, string>(123)
        .orElse((val) => {
          switch (val) {
            case '2':
              return errAsync(1)
            default:
              return errAsync('1')
          }
        })
    });

    (function it(_ = 'infers ok and err return types with multiple returns ') {
      type Expectation = ResultAsync<number, number | string>

      const result: Expectation = okAsync<number, string>(123)
        .orElse((val) => {
          switch (val) {
            case '1':
              return okAsync(1)
            case '2':
              return errAsync(1)
            default:
              return errAsync('1')
          }
        })
    });

    (function it(_ = 'allows specifying ok and err return types when mixing Result and ResultAsync in returns ') {
      type Expectation = ResultAsync<number, number | string>

      const result: Expectation = okAsync<number, string>(123)
        .orElse<number, number | string>((val) => {
          switch (val) {
            case '1':
              return ok(1)
            case '2':
              return errAsync(1)
            default:
              return errAsync('1')
          }
        })
    });

    (function it(_ = 'Creates a union of ok types for disjoint types') {
      type Expectation = ResultAsync<string | number, boolean>

      const result: Expectation = errAsync<string, boolean[]>([true])
          .orElse((val) => ok<string, boolean>('recovered!'))
    });

    (function it(_ = 'Infers ok type when returning disjoint types') {
      type Expectation = ResultAsync<string | number | boolean, unknown>

      const result: Expectation = errAsync<string, number>(123)
          .orElse((val) => {
            switch (val) {
              case 1:
                return okAsync('yoooooo dude' + val)
              case 2:
                return okAsync(123)
              default:
                return okAsync(false)
            }
          })
    });

    (function it(_ = 'Infers new type when returning both Ok and Err') {
      const initial = errAsync<string, number>(123)
      type Expectation = ResultAsync<string | true, false>

      const result: Expectation = initial
          .orElse((val) => {
            switch (val) {
              case 1:
                return err(false as const)
              default:
                return okAsync(true as const)
            }
          })
    });
  });

  (function describe(_ = 'combine') {
    (function it(_ = 'combines different result asyncs into one') {
      type Expectation = ResultAsync<[ number, string, boolean, boolean ], Error | string | string[]>;

      const result = ResultAsync.combine([
        okAsync<number, string>(1),
        okAsync<string, string>('string'),
        errAsync<boolean, string[]>([ 'string', 'string2' ]),
        errAsync<boolean, Error>(new Error('error content')),
      ])

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines only ok result asyncs into one') {
      type Expectation = ResultAsync<[ number, string ], never>;

      const result = ResultAsync.combine([
        okAsync(1),
        okAsync('string'),
      ]);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines only err results into one') {
      type Expectation = ResultAsync<[ never, never ], number | string>;

      const result = ResultAsync.combine([
        errAsync(1),
        errAsync('string'),
      ]);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines empty list result asyncs into one') {
      type Expectation = ResultAsync<never, never>;
      const results: [] = [];

      const result = ResultAsync.combine(results);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines arrays of result asyncs to a result async of an array') {
      type Expectation = ResultAsync<string[], string>;
      const results: ResultAsync<string, string>[] = [];

      const result = ResultAsync.combine(results);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function describe(_ = 'inference on large tuples') {
      (function it(_ = 'Should correctly infer the type on tuples with 6 elements') {
        type Input = CreateTuple<6, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<6, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 7 elements') {
        type Input = CreateTuple<7, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<7, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 8 elements') {
        type Input = CreateTuple<8, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<8, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 9 elements') {
        type Input = CreateTuple<9, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<9, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 10 elements') {
        type Input = CreateTuple<10, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<10, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 11 elements') {
        type Input = CreateTuple<11, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<11, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 12 elements') {
        type Input = CreateTuple<12, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<12, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 13 elements') {
        type Input = CreateTuple<13, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<13, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 14 elements') {
        type Input = CreateTuple<14, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<14, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 15 elements') {
        type Input = CreateTuple<15, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<15, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 16 elements') {
        type Input = CreateTuple<16, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<16, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 17 elements') {
        type Input = CreateTuple<17, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<17, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 18 elements') {
        type Input = CreateTuple<18, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<18, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 19 elements') {
        type Input = CreateTuple<19, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<19, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 20 elements') {
        type Input = CreateTuple<20, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<20, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 21 elements') {
        type Input = CreateTuple<21, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<21, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 22 elements') {
        type Input = CreateTuple<22, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<22, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 23 elements') {
        type Input = CreateTuple<23, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<23, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 24 elements') {
        type Input = CreateTuple<24, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<24, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 25 elements') {
        type Input = CreateTuple<25, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<25, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 26 elements') {
        type Input = CreateTuple<26, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<26, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 27 elements') {
        type Input = CreateTuple<27, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<27, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 28 elements') {
        type Input = CreateTuple<28, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<28, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 29 elements') {
        type Input = CreateTuple<29, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<29, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 30 elements') {
        type Input = CreateTuple<30, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<30, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 31 elements') {
        type Input = CreateTuple<31, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<31, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 32 elements') {
        type Input = CreateTuple<32, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<32, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 33 elements') {
        type Input = CreateTuple<33, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<33, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 34 elements') {
        type Input = CreateTuple<34, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<34, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 35 elements') {
        type Input = CreateTuple<35, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<35, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 36 elements') {
        type Input = CreateTuple<36, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<36, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 37 elements') {
        type Input = CreateTuple<37, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<37, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 38 elements') {
        type Input = CreateTuple<38, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<38, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 39 elements') {
        type Input = CreateTuple<39, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<39, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 40 elements') {
        type Input = CreateTuple<40, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<40, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 41 elements') {
        type Input = CreateTuple<41, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<41, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 42 elements') {
        type Input = CreateTuple<42, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<42, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 43 elements') {
        type Input = CreateTuple<43, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<43, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 44 elements') {
        type Input = CreateTuple<44, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<44, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 45 elements') {
        type Input = CreateTuple<45, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<45, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 46 elements') {
        type Input = CreateTuple<46, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<46, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 47 elements') {
        type Input = CreateTuple<47, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<47, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 48 elements') {
        type Input = CreateTuple<48, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<48, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 49 elements') {
        type Input = CreateTuple<49, ResultAsync<string, never>>
        type Expectation = ResultAsync<CreateTuple<49, string>, never>

        const inputValues = input<Input>()
        const result = ResultAsync.combine(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });
    });
  });

  (function describe(_ = 'combineWithAllErrors') {
    (function it(_ = 'combines different result asyncs into one') {
      type Expectation = ResultAsync<[ number, string, never, never ], (string[] | Error)[]>;

      const result = ResultAsync.combineWithAllErrors([
        okAsync(1),
        okAsync('string'),
        errAsync([ 'string', 'string2' ]),
        errAsync(new Error('error content')),
      ]);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines only ok result asyncs into one') {
      type Expectation = ResultAsync<[ number, string ], never[]>;

      const result = ResultAsync.combineWithAllErrors([
        okAsync(1),
        okAsync('string'),
      ]);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines only err result asyncs into one') {
      type Expectation = ResultAsync<[ never, never ], (number | string)[]>;

      const result = ResultAsync.combineWithAllErrors([
        errAsync(1),
        errAsync('string'),
      ]);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines arrays of result asyncs to a result of an array') {
      type Expectation = ResultAsync<string[], (number | string)[]>;
      const results: ResultAsync<string, number | string>[] = [];

      const result = ResultAsync.combineWithAllErrors(results);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function it(_ = 'combines arrays of different result asyncs to a result of an array') {
      type Expectation = ResultAsync<(string | boolean)[], (number | string)[]>;
      const results: (ResultAsync<string, number> | ResultAsync<boolean, string>)[] = [];

      const result = ResultAsync.combineWithAllErrors(results);

      const assignableToCheck: Expectation = result;
      const assignablefromCheck: typeof result = assignableToCheck;
    });

    (function describe(_ = 'inference on large tuples') {
      (function it(_ = 'Should correctly infer the type on tuples with 6 elements') {
        type Input = CreateTuple<6, ResultAsync<string, number>>
        type Expectation = ResultAsync<CreateTuple<6, string>, number[]>

        const inputValues = input<Input>()
        const result = ResultAsync.combineWithAllErrors(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 15 elements') {
        type Input = CreateTuple<15, ResultAsync<string, number>>
        type Expectation = ResultAsync<CreateTuple<15, string>, number[]>

        const inputValues = input<Input>()
        const result = ResultAsync.combineWithAllErrors(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 30 elements') {
        type Input = CreateTuple<30, ResultAsync<string, number>>
        type Expectation = ResultAsync<CreateTuple<30, string>, number[]>

        const inputValues = input<Input>()
        const result = ResultAsync.combineWithAllErrors(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'Should correctly infer the type on tuples with 49 elements') {
        type Input = CreateTuple<49 , ResultAsync<string, number>>
        type Expectation = ResultAsync<CreateTuple<49, string>, number[]>

        const inputValues = input<Input>()
        const result = ResultAsync.combineWithAllErrors(inputValues)

        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });
    });



  });
});

(function describe(_ = 'Utility types') {
  (function describe(_ = 'safeTry') {
    (function describe(_ = 'sync generator') {
      (function it(_ = 'should correctly infer the result type when generator returns Ok') {
        interface ReturnMyError {
          name: 'ReturnMyError'
        }

        type Expectation = Result<string, ReturnMyError>

        const result = safeTry(function *() {
          return ok<string, ReturnMyError>('string');
        })
        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'should correctly infer the result type when generator returns Err') {
        interface ReturnMyError {
          name: 'ReturnMyError';
        }

        type Expectation = Result<string, ReturnMyError>

        const result = safeTry(function *() {
          return err<string, ReturnMyError>({ name: 'ReturnMyError' });
        })
        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'infers the value type when calling "yield*"') {
        interface YieldMyError {
          name: 'YieldMyError';
        }
        interface ReturnMyError {
          name: 'ReturnMyError';
        }

        safeTry(function *() {
          type Expectation = number

          const unwrapped = yield* ok<number, YieldMyError>(123).safeUnwrap();
          Test.checks([
            Test.check<typeof unwrapped, Expectation, Test.Pass>(),
          ])

          return ok<string, ReturnMyError>('string');
        })
      });

      (function it(_ = 'should correctly infer the result type with multiple "yield*"') {
        interface FirstYieldMyError {
          name: 'FirstYieldMyError';
        }
        interface SecondYieldMyError {
          name: 'SecondYieldMyError';
        }
        interface ReturnMyError {
          name: 'ReturnMyError';
        }

        type Expectation = Result<string, FirstYieldMyError | SecondYieldMyError | ReturnMyError>

        const result = safeTry(function *() {
          yield* ok<number, FirstYieldMyError>(123).safeUnwrap();
          yield* err<never, SecondYieldMyError>({ name: 'SecondYieldMyError' }).safeUnwrap();
          return ok<string, ReturnMyError>('string');
        })
        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });
    });

    (function describe(_ = 'async generator') {
      (function it(_ = 'should correctly infer the result type when generator returns OkAsync') {
        interface ReturnMyError {
          name: 'ReturnMyError'
        }

        type Expectation = ResultAsync<string, ReturnMyError>

        const result = safeTry(async function *() {
          return okAsync<string, ReturnMyError>('string');
        })
        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'should correctly infer the result type when generator returns ErrAsync') {
        interface ReturnMyError {
          name: 'ReturnMyError';
        }

        type Expectation = ResultAsync<string, ReturnMyError>

        const result = safeTry(async function *() {
          return errAsync<string, ReturnMyError>({ name: 'ReturnMyError' });
        })
        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });

      (function it(_ = 'infers the value type when calling "yield*"') {
        interface YieldMyError {
          name: 'YieldMyError';
        }
        interface ReturnMyError {
          name: 'ReturnMyError';
        }

        safeTry(async function *() {
          type Expectation = number

          const unwrapped = yield* okAsync<number, YieldMyError>(123).safeUnwrap();
          Test.checks([
            Test.check<typeof unwrapped, Expectation, Test.Pass>(),
          ])

          return ok<string, ReturnMyError>('string');
        })
      });

      (function it(_ = 'should correctly infer the result type with multiple "yield*"') {
        interface FirstYieldMyError {
          name: 'FirstYieldMyError';
        }
        interface SecondYieldMyError {
          name: 'SecondYieldMyError';
        }
        interface ReturnMyError {
          name: 'ReturnMyError';
        }

        type Expectation = ResultAsync<string, FirstYieldMyError | SecondYieldMyError | ReturnMyError>

        const result = safeTry(async function *() {
          yield* okAsync<number, FirstYieldMyError>(123).safeUnwrap();
          yield* errAsync<never, SecondYieldMyError>({ name: 'SecondYieldMyError' }).safeUnwrap();
          return okAsync<string, ReturnMyError>('string');
        })
        Test.checks([
          Test.check<typeof result, Expectation, Test.Pass>(),
        ])
      });
    });
  });

  (function describe(_ = 'Transpose') {
    (function it(_ = 'should transpose an array') {
      const input: [
        [ 1, 2 ],
        [ 3, 4 ],
        [ 5, 6 ]
      ] = [
        [ 1, 2 ],
        [ 3, 4 ],
        [ 5, 6 ]
        ]
      
      type Expectation = [
        [ 1, 3, 5 ],
        [ 2, 4, 6 ]
      ]

      const transposed: Expectation = transpose(input)
    });

    (function it(_ = 'should transpose an empty array') {
      const input: [] = []

      type Expectation = []

      const transposed: Expectation = transpose(input)
    });

    (function it(_ = 'should transpose incomplete array') {
      const input: [
        [ 1, 3 ],
        [ 2,   ]
      ] = [
        [ 1, 3 ],
        [ 2,   ]
      ]

      type Expectation = [[1], [3]]

      const transposed: Expectation = transpose<typeof input>(input)
    });
  });
})();

//#region Utility function declarations for type testing

// Transpose method converts [x, y] pairs into [xs, ys] array.
declare function transpose<
  A extends unknown[][]
>(input: A): Transpose<[ ...A ]>;

//#endregion

// create dummy values with a desired type
const input = <T>(): T => 123 as any
