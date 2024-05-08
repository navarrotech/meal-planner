import { defineConfig } from 'vite'

// Node.js
import path from 'path'

// Plugins:
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths' // https://www.npmjs.com/package/vite-tsconfig-paths

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
  ],
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `
          @use '@/sass/theme.sass' as *
          @use 'sass:color'
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
})
