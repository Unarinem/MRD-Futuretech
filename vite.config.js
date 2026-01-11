import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/MRD-Futuretech/",
  server: {
    host: true,      // allow LAN access
    port: 5173,      // explicit port
    strictPort: false // auto-pick another port if busy
  }
})