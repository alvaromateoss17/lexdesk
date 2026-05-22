import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'LexDesk — Gestión de Despacho',
        short_name: 'LexDesk',
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
        // Cache the app shell and all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Network-first for API/Supabase calls, cache-first for assets
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
