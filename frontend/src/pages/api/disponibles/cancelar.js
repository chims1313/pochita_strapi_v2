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
    const disponibleId = formData.get('id');
    const motivo = formData.get('motivo') || 'Cancelado por veterinario';

    if (!disponibleId) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Actualizar bloque disponible
    const payload = {
      data: {
        cupos_disponibles: 0,
        // Puedes agregar un campo 'cancelado' o 'motivo' si lo creaste
      }
    };

    const res = await fetch(`${STRAPI_URL}/api/disponibles/${disponibleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.jwt}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error cancelando horario:', errorData);
      return new Response(JSON.stringify({ error: 'Error' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Crear notificación para recepcionistas
    // Obtener todos los recepcionistas
    const resReceps = await fetch(
      `${STRAPI_URL}/api/users?filters[role][name][$eq]=Recepcionista`,
      { headers: { 'Authorization': `Bearer ${user.jwt}` } }
    );

    if (resReceps.ok) {
      const recepcionistas = await resReceps.json();
      
      // Crear notificación para cada recepcionista
      for (const recep of recepcionistas) {
        const notifPayload = {
          data: {
            mensaje: `El Dr. ${user.username} canceló un horario. Motivo: ${motivo}`,
            tipo: 'cancelacion',
            leida: false,
            destinatario: recep.id,
          }
        };

        await fetch(`${STRAPI_URL}/api/notificacions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.jwt}`,
          },
          body: JSON.stringify(notifPayload),
        });
      }
    }

    return new Response(null, {
      status: 303,
      headers: { 'Location': '/dashboard_veterinario' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
