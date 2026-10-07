import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages proje alt dizini: https://<kullanici>.github.io/devvault/
  base: '/devvault/',
  plugins: [react(), tailwindcss()],
})
