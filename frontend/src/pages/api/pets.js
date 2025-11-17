// frontend/src/pages/api/pets.js
export async function POST({ request }) {
  try {
    const formData = await request.formData();

    const nombre = formData.get('nombre');
    const especie = formData.get('especie');
    const raza = formData.get('raza');
    const edad = formData.get('edad');
    const notas = formData.get('notas');

    // Leer user de la cookie
    const cookieHeader = request.headers.get('cookie') ?? '';
    const match = cookieHeader.match(/user=([^;]+)/);
    const user = match ? JSON.parse(decodeURIComponent(match[1])) : null;

    if (!user) {
      return new Response('No autenticado', { status: 401 });
    }

    const payload = {
      data: {
        nombre,
        especie,
        raza,
        edad: edad ? Number(edad) : null,
        notas,
        dueno: user.id,
      },
    };

    const res = await fetch(`${import.meta.env.PUBLIC_STRAPI_URL}/api/mascotas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Error al crear mascota:', res.status, await res.text());
      return new Response('Error al crear mascota', { status: 500 });
    }

    return new Response(null, {
      status: 302,
      headers: { Location: '/cliente_dashboard' },
    });
  } catch (err) {
    console.error('Error en /api/pets:', err);
    return new Response('Error al crear mascota', { status: 500 });
  }
}
