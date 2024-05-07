import { defineConfig } from 'vite'

// Plugins:
import react from '@vitejs/plugin-react'

// https://www.npmjs.com/package/vite-tsconfig-paths
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
  ]
})
