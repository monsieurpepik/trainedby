import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

export default defineConfig({
  // Primary site — used for canonical URLs and sitemap base
  site: 'https://trainedby.ae',
  integrations: [
    tailwind(),
    sitemap({
      // All domains share the same routes; each serves localised content
      customPages: [
        'https://trainedby.ae/',
        'https://trainedby.com/',
        'https://trainedby.co.uk/',
        'https://trainedby.in/',
        'https://coachepar.fr/',
        'https://coachepar.com/',
        'https://allenaticon.it/',
        'https://allenaticon.com/',
        'https://entrenacon.com/',
        'https://entrenacon.mx/',
      ],
    }),
  ],
  // SSR mode — renders per-request so market/brand detection works correctly
  // on all domains (entrenacon.com → EntrenaCon, coachepar.fr → CoachéPar, etc.)
  output: 'server',
  adapter: netlify(),
  build: {
    assets: '_astro',
  },
});
