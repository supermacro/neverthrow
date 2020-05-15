// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPromise = <T>(obj: any): obj is Promise<T> => {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  )
}
