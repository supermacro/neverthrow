/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test'
import { equal, ok as isTrue } from 'node:assert'
import { Result, ok, safeTry } from '../src/result.js'

describe('Returns what is returned from the generator function', () => {
  const val = 'value'

  it('With synchronous Ok', () => {
    const res = safeTry(function * () { // eslint-disable-line require-yield
      return ok(val)
    })
    isTrue(res instanceof Result)
    equal(res._unsafeUnwrap(), val)
  })
})
