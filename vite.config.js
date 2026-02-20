import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
       main: './volgograd-online/src/main.jsx'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
