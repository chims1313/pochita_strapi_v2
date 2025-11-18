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

    if (!user.jwt) {
      return new Response(JSON.stringify({ error: 'Token no encontrado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const petId = formData.get('id');
    const nombre = formData.get('nombre');
    const especie = formData.get('especie') || 'perro';
    const raza = formData.get('raza') || '';
    const edad = parseInt(formData.get('edad')) || 0;
    const notas = formData.get('notas') || '';

    if (!petId) {
      return new Response(JSON.stringify({ error: 'ID de mascota requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = {
      data: {
        nombre,
        especie,
        raza,
        edad,
        notas,
      }
    };

    // Actualizar mascota en Strapi
    const res = await fetch(`${STRAPI_URL}/api/mascotas/${petId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.jwt}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error al actualizar mascota:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Error al actualizar mascota',
        details: errorData 
      }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await res.json();
    console.log('Mascota actualizada:', result);
    
    return new Response(null, {
      status: 303,
      headers: { 'Location': '/cliente_dashboard' },
    });

  } catch (error) {
    console.error('Error en /api/pets/update:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
