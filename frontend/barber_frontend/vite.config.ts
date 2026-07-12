import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// HMR no GitHub Codespaces (proxy HTTPS na porta 443)
const codespaceName = process.env.CODESPACE_NAME
const codespaceDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Aceita *.app.github.dev e qualquer host do preview
    allowedHosts: true,
    // Evita erro de WebSocket/HMR ao abrir via URL pública do Codespaces
    hmr: codespaceName && codespaceDomain
      ? {
          protocol: 'wss',
          host: `${codespaceName}-5173.${codespaceDomain}`,
          clientPort: 443,
        }
      : undefined,
  },
})
