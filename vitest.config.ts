import { defineConfig } from 'vitest/config'

// Data-layer tests run in a plain Node environment (no DOM needed — the sources
// and aggregator are framework-agnostic). `fetch` is stubbed per test.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: true,
  },
})
