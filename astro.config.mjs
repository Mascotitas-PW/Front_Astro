// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import { AstroPWAIntegration } from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://mascotitas-pw.github.io',
  base: '/Front_Astro/',
  integrations: [
    react(),
    AstroPWAIntegration({
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
            src: '/Front_Astro/icons/mascotitas-192.svg',
            type: 'image/svg+xml',
            sizes: '192x192',
            purpose: 'any'
          },
          {
            src: '/Front_Astro/icons/mascotitas-512.svg',
            type: 'image/svg+xml',
            sizes: '512x512',
            purpose: 'any maskable'
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
  }
  
});