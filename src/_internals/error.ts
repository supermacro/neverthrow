import { Result } from '../result'

export interface ErrorConfig {
  withStackTrace: boolean
}

const defaultErrorConfig: ErrorConfig = {
  withStackTrace: false,
}

interface NeverThrowError<T, E> {
  data:
    | {
        type: string
        value: T
      }
    | {
        type: string
        value: E
      }
  message: string
  stack: string | undefined
}

// Custom error object
// Context / discussion: https://github.com/supermacro/neverthrow/pull/215
export const createNeverThrowError = <T, E>(
  message: string,
  result: Result<T, E>,
  config: ErrorConfig = defaultErrorConfig,
): NeverThrowError<T, E> => {
  const data = result.isOk()
    ? { type: 'Ok', value: result.value }
    : { type: 'Err', value: result.error }

  const maybeStack = config.withStackTrace ? new Error().stack : undefined

  return {
    data,
    message,
    stack: maybeStack,
  }
}
