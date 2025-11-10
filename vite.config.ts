import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  define: {
    'import.meta.env.VITE_SPOTIFY_CLIENT_ID': JSON.stringify('0dc2537dffbf48ee94a5eaa72dd36c50'),
    'import.meta.env.VITE_REDIRECT_URI': JSON.stringify('http://127.0.0.1:5173/callback'),
    'import.meta.env.VITE_SETLISTFM_API_KEY': JSON.stringify('peDY3aIDvVQi1wX5TGHVpWYFSQvNYBjnFxAa'),
  },
})
