import { Result } from '../result'

export interface ErrorConfig {
  withStackTrace: boolean
}

const defaultErrorConfig: ErrorConfig = {
  withStackTrace: false,
}

// Custom error object
// Context / discussion: https://github.com/supermacro/neverthrow/pull/215
export const createNeverThrowError = <T, E>(
  message: string,
  result: Result<T, E>,
  config: ErrorConfig = defaultErrorConfig,
) => {
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
