import { defineConfig } from 'astro/config';

// URL base de Strapi para el frontend
const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default defineConfig({
  output: 'server',
  server: {
    host: true,
    port: 4321,
  },
  vite: {
    define: {
      'import.meta.env.PUBLIC_STRAPI_URL': JSON.stringify(STRAPI_URL),
    },
  },
});
