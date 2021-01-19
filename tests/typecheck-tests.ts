/*
 * Type Tests
 *
 * This file is ran during CI to ensure that there aren't breaking changes with types
 */
import { combine, ok, err, Result } from '../src'

(function describe(_ = 'Combine on Unbounded lists') {
  (function describe(_ = 'Heterogeneous list') {
    (function it(_= 'does not contain `unknown` values') {
      /*
      type ListType
        = Result<number, unknown>
        | Result<unknown, string>
        | Result<boolean, unknown>
      */

      // this test fails if I provide the above anotation
      const myList = [
        ok(123),
        err('hello'),
        ok(true)
      ] 

      type Expectation = Result<( number | boolean )[], string>

      const combined: Expectation = combine(myList)

      return combined
    })();

    (function it(_= 'maps `unknown` to `never` if `unknown` is the only possible value.') {
      const myList = [
        ok(123),
        ok(true)
      ]

      type Expectation = Result<( number | boolean )[], never>

      const combined: Expectation = combine(myList)

      return combined
    })
  })();
})();


class InvalidTest {}

const ok1 = ok('my value1');
const ok2 = ok(2);
const err1 = err(new InvalidTest());

const arrayOfResWithErr: (
  | Result<string, unknown>
  | Result<unknown, InvalidTest>
)[] = [ok1, err1];

const combinedResultsErr = combine(arrayOfResWithErr);


