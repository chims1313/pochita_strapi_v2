# Auth básico con Strapi + Astro

Esta rama configura un flujo mínimo de autenticación usando Strapi 5 como API y Astro 5 como frontend.

## Archivos añadidos

- `frontend/astro.config.mjs`: expone `PUBLIC_STRAPI_URL` al frontend y configura Astro.
- `frontend/.env.example`: ejemplo de variables de entorno.
- `frontend/src/lib/auth.js`: helper de login contra `/api/auth/local` de Strapi.
- `frontend/src/pages/api/login.js`: endpoint de Astro que hace login y guarda `token` y `user` en cookies.
- `frontend/src/pages/login.astro`: formulario de login.
- `frontend/src/pages/dashboard.astro`: página protegida que muestra datos del usuario y su rol.

## Pasos para usarlo

1. En el backend Strapi, asegúrate de tener el plugin `users-permissions` activo y creado al menos un usuario.
2. Crea en Strapi los roles `Cliente`, `Veterinario` y `Recepcionista` y asigna permisos a las rutas que quieras proteger.
3. En `frontend`, copia `.env.example` a `.env` y ajusta `PUBLIC_STRAPI_URL` si la URL de Strapi es distinta.
4. Ejecuta el frontend con `npm install` y `npm run dev` desde la carpeta `frontend`.
5. Ve a `http://localhost:4321/login`, inicia sesión con un usuario de Strapi y deberías ser redirigido a `/dashboard` viendo su rol.
