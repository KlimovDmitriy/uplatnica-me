import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Lets tests import app code that uses the Nuxt alias for shared/ ("#shared/utils/…").
export default defineConfig({
  resolve: { alias: { '#shared': fileURLToPath(new URL('./shared', import.meta.url)) } },
})
