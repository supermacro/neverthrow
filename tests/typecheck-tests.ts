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
  });
});


(function describe(_ = 'Combine on Unbounded lists') {
  // TODO:
  // https://github.com/supermacro/neverthrow/issues/226
})();

