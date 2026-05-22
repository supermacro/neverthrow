import { defineConfig } from 'tsdown'

export default defineConfig({
  format: ['esm', 'cjs'],
  exports: true,
  attw: true,
})
