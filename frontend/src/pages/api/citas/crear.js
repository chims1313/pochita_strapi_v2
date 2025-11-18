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
    const fecha = formData.get('fecha');
    const hora = formData.get('hora');
    const veterinario = formData.get('veterinario');
    const cliente = formData.get('cliente');
    const mascota = formData.get('mascota');
    const motivo = formData.get('motivo') || '';

    // Validar campos requeridos
    if (!fecha || !hora || !veterinario || !cliente || !mascota) {
      return new Response(JSON.stringify({ error: 'Campos requeridos faltantes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Crear cita en Strapi
    const payload = {
      data: {
        fecha,
        hora,
        veterinario: parseInt(veterinario),
        cliente: parseInt(cliente),
        mascota: parseInt(mascota),
        motivo,
        estado: 'pendiente',
      }
    };

    const res = await fetch(`${STRAPI_URL}/api/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.jwt}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error creando cita:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Error al crear cita',
        details: errorData 
      }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await res.json();
    console.log('Cita creada:', result);

    // Actualizar cupos disponibles
    // TODO: Buscar el bloque disponible correspondiente y decrementar cupos_disponibles

    return new Response(null, {
      status: 303,
      headers: { 'Location': '/dashboard_recepcionista' },
    });

  } catch (error) {
    console.error('Error en /api/citas/crear:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
