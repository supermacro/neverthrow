/*
 * Type Tests
 *
 * This file is ran during CI to ensure that there aren't breaking changes with types
 */
import { ok, err, okAsync, errAsync, Result, ResultAsync } from '../src'

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
  });
});


(function describe(_ = 'Combine on Unbounded lists') {
  // TODO:
  // https://github.com/supermacro/neverthrow/issues/226
})();

