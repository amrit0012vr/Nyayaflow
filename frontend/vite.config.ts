/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

let gitSha = 'eee2c40'
try {
  gitSha = execSync('git rev-parse --short HEAD').toString().trim()
} catch {
  // fallback
}

const buildDate = new Date().toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(process.env.VITE_BUILD_DATE || buildDate),
    'import.meta.env.VITE_GIT_SHA': JSON.stringify(process.env.VITE_GIT_SHA || gitSha),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
  }
})
