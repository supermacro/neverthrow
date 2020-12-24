import { Result } from '../result'

// Custom error object
// Context / discussion: https://github.com/supermacro/neverthrow/pull/215
export const createNeverThrowError = <T, E>(message: string, result: Result<T, E>) => {
  const data = result.isOk()
    ? { type: 'Ok', value: result.value }
    : { type: 'Err', value: result.error }

  return {
    data,
    message,
  }
}
