import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '217c-196-249-123-171.ngrok-free.app',
      'api.natakahii.com'
    ],
  },
})