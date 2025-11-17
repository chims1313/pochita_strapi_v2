// src/middleware.js
import { defineMiddleware } from 'astro:middleware';

const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';

export const onRequest = defineMiddleware(async (context, next) => {
  const jwt = context.cookies.get('jwt')?.value;

  if (jwt) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (res.ok) {
        const user = await res.json();
        context.locals.user = user;
      } else {
        context.cookies.delete('jwt', { path: '/' });
      }
    } catch (err) {
      console.error('Error obteniendo usuario de Strapi:', err);
    }
  }

  return next();
});
