// src/lib/auth.js
// Helpers para autenticación contra la API de Strapi usando JWT

const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Login contra Strapi usando /api/auth/local
 * @param {string} identifier - email o username
 * @param {string} password
 */
export async function login(identifier, password) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error?.message || 'Credenciales inválidas');
  }

  const data = await res.json(); // { jwt, user }
  return data;
}
