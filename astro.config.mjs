// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import { AstroPWAIntegration as AstroPWA } from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://mascotitas-pw.github.io',
  base: '/Front_Astro/',
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Mascotitas',
        short_name: 'Mascotitas',
        description: 'E-commerce de mascotas',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/Front_Astro/',
        scope: '/Front_Astro/',
        lang: 'es-MX',
        icons: [
          {
            src: 'icons/mascotitas-192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'any'
          },
          {
            src: 'icons/mascotitas-512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'any'
          },
          {
            src: 'icons/mascotitas-512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,ico,json,woff2}']
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()],
  },
  i18n: { defaultLocale: 'es', locales: ['es', 'en'], routing: { prefixDefaultLocale: false } },
});