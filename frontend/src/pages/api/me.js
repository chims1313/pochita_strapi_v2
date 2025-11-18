// src/pages/api/me.js
export async function GET({ cookies }) {
  const jwt = cookies.get("jwt")?.value;
  const STRAPI_URL = "http://localhost:1337";

  if (!jwt) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Obtener datos del usuario
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (!userResponse.ok) {
      return new Response(JSON.stringify({ error: "Error al obtener usuario" }), {
        status: userResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userData = await userResponse.json();
    
    // Obtener el rol del usuario haciendo una consulta específica
    const roleResponse = await fetch(
      `${STRAPI_URL}/api/users/${userData.id}?populate[role][fields][0]=name&populate[role][fields][1]=type`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );

    if (roleResponse.ok) {
      const userWithRole = await roleResponse.json();
      return new Response(JSON.stringify(userWithRole), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Si falla, devolver usuario sin rol
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en /api/me:", error);
    return new Response(JSON.stringify({ error: "Error del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
