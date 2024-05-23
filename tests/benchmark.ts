import { performance } from 'perf_hooks'
import { combineResultList, combineResultListFast } from '../src/_internals/utils'
import { ok, Result } from '../src'

// Define input sizes
const inputSizes = [100, 1000, 10000, 100000, 500000]

// Prepare results array
const results: {
  numElements: number
  timeOld: number
  timeNew: number
  areResultsSame: boolean
  improvement: string
}[] = []

// Iterate over input sizes
for (const numElements of inputSizes) {
  // Start spinner
  let i = 0

  // Prepare data
  const data: Result<number, string>[] = []
  for (let i = 0; i < numElements; i++) {
    data.push(ok(i))
  }

  // Benchmark combineResultList
  const t0 = performance.now()
  const result = combineResultList(data)
  const t1 = performance.now()

  // Benchmark combineResultListFast
  const t2 = performance.now()
  const resultFast = combineResultListFast(data)
  const t3 = performance.now()

  if (numElements === 100) {
    console.log('result', result)
    console.log('resultFast', resultFast)
  }

  // Check if results are the same
  const areResultsSame = JSON.stringify(result) === JSON.stringify(resultFast)

  // Calculate relative improvement
  const improvement = Math.floor((t1 - t0) / (t3 - t2))

  // Add results to results array
  results.push({
    numElements,
    timeOld: t1 - t0,
    timeNew: t3 - t2,
    areResultsSame,
    improvement: `${improvement}x`,
  })
}


// Output results as a table
console.table(results)

