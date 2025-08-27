import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5001", // ✅ Works only in local dev
    },
  },
  build: {
    outDir: "dist", // Render expects this folder
  },
})
