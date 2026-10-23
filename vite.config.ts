import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' — чтобы сборка работала и на GitHub Pages, и просто как открытый файл
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
