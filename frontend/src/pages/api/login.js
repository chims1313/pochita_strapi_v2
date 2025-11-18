const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function POST({ request, cookies }) {
  try {
    const body = await request.json();
    const identifier = body.email || body.identifier;
    const password = body.password;

    console.log('🔐 Intentando login con:', identifier);

    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();
    
    console.log('📡 Respuesta de Strapi:', {
      ok: res.ok,
      status: res.status,
      hasJwt: !!data.jwt,
      hasUser: !!data.user
    });

    if (!res.ok) {
      console.error('❌ Login fallido:', data);
      return new Response(JSON.stringify({ 
        ok: false, 
        error: data.error?.message || 'Credenciales inválidas' 
      }), {
        status: res.status || 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificar que tenemos el JWT
    if (!data.jwt) {
      console.error('❌ Strapi no devolvió JWT. Respuesta completa:', data);
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'No se recibió token de autenticación' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = data.user;

    // Preparar el objeto completo para la cookie
    const userCookie = {
      id: user.id,
      username: user.username,
      email: user.email,
      jwt: data.jwt,  // ⬅️ CRÍTICO: Asegurar que viene de data.jwt
      role: user.role?.name || user.role,
    };

    console.log('✅ Guardando cookie con JWT:', {
      id: userCookie.id,
      username: userCookie.username,
      hasJwt: !!userCookie.jwt,
      jwtPreview: userCookie.jwt.substring(0, 20) + '...'
    });

    // Guardar en cookie
    cookies.set('user', JSON.stringify(userCookie), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return new Response(JSON.stringify({ 
      ok: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error en login:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: 'Error del servidor',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
