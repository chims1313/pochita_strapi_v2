// src/pages/api/availability.js
const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || "http://localhost:1337";

/** @type {import("astro").APIRoute} */
export async function POST({ request }) {
  try {
    const body = await request.json();
    const fecha = body.fecha ?? body.date;
    const horaDesde = body.horaDesde ?? body.from;
    const horaHasta = body.horaHasta ?? body.to;
    const slotMinutos =
      body.slotMinutos ?? (body.slot !== undefined ? Number(body.slot) : undefined);

    const cookieHeader = request.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/user=([^;]+)/);

    if (!match) {
      console.error("No se encontró la cookie user en la petición a /api/availability");
      return new Response("No autenticado", { status: 401 });
    }

    let user;
    try {
      user = JSON.parse(decodeURIComponent(match[1]));
    } catch (err) {
      console.error("Error parseando cookie user:", err);
      return new Response("No autenticado", { status: 401 });
    }

    const veterinarioId = user.id ?? user.documentId;
    let jwt = user.jwt;
    if (!jwt) {
      const jwtMatch = cookieHeader.match(/jwt=([^;]+)/);
      if (jwtMatch) jwt = decodeURIComponent(jwtMatch[1]);
    }

    if (!veterinarioId || !jwt) {
      console.error("Cookie user sin id o jwt válidos:", user);
      return new Response("No autenticado", { status: 401 });
    }

    const payload = {
      data: {
        fecha,
        hora_desde: horaDesde,
        hora_hasta: horaHasta,
        slot_minutos: slotMinutos !== undefined ? Number(slotMinutos) : undefined,
        // OJO: no enviamos `veterinario` desde el frontend; lo asigna el backend
      },
    };

    console.log("DEBUG /api/availability payload hacia Strapi:", JSON.stringify(payload, null, 2));

    const res = await fetch(`${STRAPI_URL}/api/disponibles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Error desde Strapi al crear Disponible:", res.status, errorBody);
      return new Response("Error al guardar disponibilidad", { status: 500 });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error inesperado en /api/availability:", err);
    return new Response("Error al guardar disponibilidad", { status: 500 });
  }
}
