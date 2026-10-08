import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Local: /. GitHub Pages: set VITE_BASE=/oink/ in the deploy workflow.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
