import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    target: 'esnext'
  },
  define: {
    global: 'globalThis'
  }
})
