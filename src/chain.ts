import { Result } from './result'

const toPromise = <T, E>(val: Promise<Result<T, E>> | Result<T, E>): Promise<Result<T, E>> =>
  val instanceof Promise ? val : Promise.resolve(val)

// Functor implementation for functions
// but tailored specifically for Result
// https://eli.thegreenplace.net/2018/haskell-functions-as-functors-applicatives-and-monads/
const mapFn = <T1, T2, E>(
  g: (p: Promise<Result<T2, E>> | Result<T2, E>) => Promise<Result<T2, E>>,
  ff: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
): ((v: T1) => Promise<Result<T2, E>>) => {
  return (val: T1) => {
    return g(ff(val))
  }
}

export const chain = async <T1, T2, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>>,
): Promise<Result<T2, E>> => {
  const inner = await r1

  const mapped = await inner.asyncMap(r2)

  return mapped.andThen((inner) => inner)
}

export const chain3 = async <T1, T2, T3, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>>,
): Promise<Result<T3, E>> => {
  const r2Promise = mapFn(toPromise, r2)

  const chained = await chain(r1, r2Promise)

  const mapped = await chained.asyncMap(r3)

  return mapped.andThen((inner) => inner)
}

export const chain4 = async <T1, T2, T3, T4, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>> | Result<T3, E>,
  r4: (v: T3) => Promise<Result<T4, E>>,
): Promise<Result<T4, E>> => {
  const r3Promise = mapFn(toPromise, r3)

  const chained = await chain3(r1, r2, r3Promise)

  const mapped = await chained.asyncMap(r4)

  return mapped.andThen((inner) => inner)
}

export const chain5 = async <T1, T2, T3, T4, T5, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>> | Result<T3, E>,
  r4: (v: T3) => Promise<Result<T4, E>> | Result<T4, E>,
  r5: (v: T4) => Promise<Result<T5, E>>,
): Promise<Result<T5, E>> => {
  const r4Promise = mapFn(toPromise, r4)

  const chained = await chain4(r1, r2, r3, r4Promise)

  const mapped = await chained.asyncMap(r5)

  return mapped.andThen((inner) => inner)
}

export const chain6 = async <T1, T2, T3, T4, T5, T6, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>> | Result<T3, E>,
  r4: (v: T3) => Promise<Result<T4, E>> | Result<T4, E>,
  r5: (v: T4) => Promise<Result<T5, E>> | Result<T5, E>,
  r6: (v: T5) => Promise<Result<T6, E>>,
): Promise<Result<T6, E>> => {
  const r5Promise = mapFn(toPromise, r5)

  const chained = await chain5(r1, r2, r3, r4, r5Promise)

  const mapped = await chained.asyncMap(r6)

  return mapped.andThen((inner) => inner)
}

export const chain7 = async <T1, T2, T3, T4, T5, T6, T7, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>> | Result<T3, E>,
  r4: (v: T3) => Promise<Result<T4, E>> | Result<T4, E>,
  r5: (v: T4) => Promise<Result<T5, E>> | Result<T5, E>,
  r6: (v: T5) => Promise<Result<T6, E>> | Result<T6, E>,
  r7: (v: T6) => Promise<Result<T7, E>>,
): Promise<Result<T7, E>> => {
  const r6Promise = mapFn(toPromise, r6)

  const chained = await chain6(r1, r2, r3, r4, r5, r6Promise)

  const mapped = await chained.asyncMap(r7)

  return mapped.andThen((inner) => inner)
}

export const chain8 = async <T1, T2, T3, T4, T5, T6, T7, T8, E>(
  r1: Promise<Result<T1, E>>,
  r2: (v: T1) => Promise<Result<T2, E>> | Result<T2, E>,
  r3: (v: T2) => Promise<Result<T3, E>> | Result<T3, E>,
  r4: (v: T3) => Promise<Result<T4, E>> | Result<T4, E>,
  r5: (v: T4) => Promise<Result<T5, E>> | Result<T5, E>,
  r6: (v: T5) => Promise<Result<T6, E>> | Result<T6, E>,
  r7: (v: T6) => Promise<Result<T7, E>> | Result<T7, E>,
  r8: (v: T7) => Promise<Result<T8, E>>,
): Promise<Result<T8, E>> => {
  const r7Promise = mapFn(toPromise, r7)

  const chained = await chain7(r1, r2, r3, r4, r5, r6, r7Promise)

  const mapped = await chained.asyncMap(r8)

  return mapped.andThen((inner) => inner)
}
