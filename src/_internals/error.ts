import { Result } from '../result'

export interface ErrorConfig {
  withStackTrace: boolean
}

const defaultErrorConfig: ErrorConfig = {
  withStackTrace: false,
}

type ErrorData<T, E> = {
  type: string
  value: T
} | {
  type: string
  value: E
}

class NeverThrowError<T, E> extends Error {
  data: ErrorData<T, E>

  constructor({
    data,
    message,
    stack,
  }: {
    data: ErrorData<T, E>
    message: string
    stack: string | undefined
  }) {
    super();
    this.data = data;
    this.message = message;
    this.stack = stack;
    Object.setPrototypeOf(this, new.target.prototype);
  }
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

  return new NeverThrowError<T, E>({
    data,
    message,
    stack: maybeStack,
  })
}
