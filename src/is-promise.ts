// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPromise = <T>(obj: any): obj is Promise<T> => {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  )
}

export { isPromise }
