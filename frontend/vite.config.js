import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Required by amazon-cognito-identity-js (expects a Node-style `global`).
    global: 'globalThis',
  },
})
