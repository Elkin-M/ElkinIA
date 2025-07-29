import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['funny-colts-see.loca.lt'],
    port: 5174, // cambia el puerto si usas otro
  },
})
