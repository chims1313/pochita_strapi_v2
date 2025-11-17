// frontend/src/pages/api/appointments.js
export async function POST({ request }) {
  try {
    const formData = await request.formData();

    // Nota: `fecha` proviene directamente de <input type="date"> y viene
    // en formato ISO local `YYYY-MM-DD` (p. ej. '2025-11-22').
    // Strapi acepta este formato para campos Date — NO formatees ni reordenes.
    const citaId = formData.get('citaId'); // puede venir vacío
    const fecha = formData.get('fecha'); // ej: 2025-11-22
    const horaCruda = formData.get('hora'); // ej: 09:30
    const motivo = formData.get('motivo'); 
    const dueno = formData.get('dueno');
    const mascota = formData.get('mascota');

    // Si viene en formato HH:mm (p. ej. '09:30'), convertir a
    // HH:mm:00.000 para ajustarse a formatos Time/DateTime si Strapi lo espera.
    let hora = horaCruda;
    if (horaCruda && /^\d{2}:\d{2}$/.test(horaCruda)) {
      hora = `${horaCruda}:00.000`;
    }

    console.log('DEBUG fecha:', fecha);
    console.log('DEBUG hora final:', hora);

    const payload = {
      data: {
        fecha, // va directo al campo Date
        hora, // convertido a HH:mm:ss.SSS si venía HH:mm
        motivo,
      },
    };

    const cookieHeader = request.headers.get('cookie') ?? '';
    const match = cookieHeader.match(/user=([^;]+)/);
    let jwt = null;
    if (match) {
      try {
        jwt = JSON.parse(decodeURIComponent(match[1])).jwt;
      } catch (e) {
        jwt = null;
      }
    }

    const baseUrl = import.meta.env.PUBLIC_STRAPI_URL;
    const url = citaId ? `${baseUrl}/api/citas/${citaId}` : `${baseUrl}/api/citas`;
    const method = citaId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Error al crear cita en Strapi:', res.status, await res.text());
      return new Response('Error al crear cita', { status: 500 });
    }

    // Redirigir de vuelta al dashboard de recepción
    return new Response(null, {
      status: 302,
      headers: { Location: '/dashboard_recepcionista' },
    });
  } catch (err) {
    console.error('Error en /api/appointments:', err);
    return new Response('Error al crear cita', { status: 500 });
  }
}
