// src/pages/api/login.js
// Endpoint de Astro que hace login en Strapi y guarda el JWT en una cookie

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function POST(context) {
  const { request, cookies } = context;

  const { identifier, password } = await request.json();

  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ message: 'Credenciales inválidas' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json(); // { jwt, user }

  // Guardamos el JWT en cookie httpOnly y el usuario en una cookie legible por el cliente
  cookies.set('token', data.jwt, {
    path: '/',
    httpOnly: true,
  });

  cookies.set('user', JSON.stringify(data.user), {
    path: '/',
  });

  return new Response(JSON.stringify({ user: data.user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
