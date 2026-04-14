import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

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
        'https://trainedby.uk/',
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
  output: 'static',
  build: {
    assets: '_astro',
  },
});
