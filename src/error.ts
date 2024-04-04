import { Result } from './result.js'

export interface ErrorConfig {
  withStackTrace: boolean
}

const defaultErrorConfig: ErrorConfig = {
  withStackTrace: false,
}

interface ResultarError<T, E> {
  data:
  | {
    type: string
    value: T | undefined
  }
  | {
    type: string
    value: E | undefined
  }
  message: string
  stack: string | undefined
}

export const createResultarError = <T, E>(
  message: string,
  result: Result<T, E>,
  config: ErrorConfig = defaultErrorConfig,
): ResultarError<T, E> => {
  const data = result.isOk()
    ? { type: 'Ok', value: result.value }
    : { type: 'Err', value: result.error }

  const maybeStack = config.withStackTrace ? new Error().stack : undefined // eslint-disable-line unicorn/error-message

  return {
    data,
    message,
    stack: maybeStack,
  }
}
