import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api/chat': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: () => '/v1/messages',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-api-key', process.env.ANTHROPIC_API_KEY || '');
            proxyReq.setHeader('anthropic-version', '2023-06-01');
            proxyReq.removeHeader('origin');
          });
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Vincla — Gestión de Despacho',
        short_name: 'Vincla',
        description: 'Plataforma de gestión para despachos de abogados. Expedientes, facturación, calendario y más.',
        theme_color: '#0C0E14',
        background_color: '#0C0E14',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'es',
        categories: ['business', 'productivity'],
        icons: [
          { src: '/icons/icon-72.png',           sizes: '72x72',     type: 'image/png' },
          { src: '/icons/icon-96.png',           sizes: '96x96',     type: 'image/png' },
          { src: '/icons/icon-128.png',          sizes: '128x128',   type: 'image/png' },
          { src: '/icons/icon-144.png',          sizes: '144x144',   type: 'image/png' },
          { src: '/icons/icon-152.png',          sizes: '152x152',   type: 'image/png' },
          { src: '/icons/icon-192.png',          sizes: '192x192',   type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-384.png',          sizes: '384x384',   type: 'image/png' },
          { src: '/icons/icon-512.png',          sizes: '512x512',   type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192',   type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512',   type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Expedientes',
            short_name: 'Expedientes',
            url: '/expedientes',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'Calendario',
            short_name: 'Calendario',
            url: '/calendario',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'Facturación',
            short_name: 'Facturación',
            url: '/facturacion',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
