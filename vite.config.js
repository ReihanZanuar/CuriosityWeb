import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable source maps in production — prevents code inspection via DevTools
    sourcemap: false,
    // Remove console.* and debugger statements in production bundle
    minify: 'esbuild',
    target: 'es2018',
    rollupOptions: {
      output: {
        // Obfuscate chunk names so file structure is harder to reverse-engineer
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/ollama/api/chat': {
        target: process.env.VITE_OLLAMA_PROXY_TARGET || 'http://10.99.98.47:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Ollama is offline or unreachable' }));
            }
          });
        },
      },
      '/ollama/api/tags': {
        target: process.env.VITE_OLLAMA_PROXY_TARGET || 'http://10.99.98.47:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Ollama is offline or unreachable' }));
            }
          });
        },
      },
    },
  },
})


