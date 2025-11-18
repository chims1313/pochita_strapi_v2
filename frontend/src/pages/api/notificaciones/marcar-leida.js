const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function POST({ request, cookies }) {
  try {
    const userCookie = cookies.get('user');
    if (!userCookie?.value) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let user;
    try {
      user = JSON.parse(userCookie.value);
    } catch {
      return new Response(JSON.stringify({ error: 'Cookie corrupta' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const notifId = formData.get('id');

    if (!notifId) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Marcar como leída
    const payload = {
      data: {
        leida: true,
      }
    };

    const res = await fetch(`${STRAPI_URL}/api/notificacions/${notifId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.jwt}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error marcando notificación:', errorData);
      return new Response(JSON.stringify({ error: 'Error' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
