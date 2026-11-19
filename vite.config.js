import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const srcLogo = path.resolve('src/assets/logo.png')
try {
  if (fs.existsSync(srcLogo)) {
    fs.copyFileSync(srcLogo, path.resolve('public/logo.png'))
  }
} catch (e) {
  console.error("Logo copy notice:", e)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

