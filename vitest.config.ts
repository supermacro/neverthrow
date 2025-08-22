import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      include: ['tests/typecheck-tests.ts'],
      tsconfig: 'tests/tsconfig.tests.json',
    },
  },
})
