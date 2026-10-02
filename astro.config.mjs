// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://mascotitas-pw.github.io',
  base: '/Front_Astro',
  integrations: [react()]
});