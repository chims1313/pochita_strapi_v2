export async function POST({ cookies }) {
  try {
    // Eliminar la cookie JWT
    cookies.delete("jwt", { path: "/" });
    
    console.log("✅ Sesión cerrada - Cookie JWT eliminada");

    return new Response(
      JSON.stringify({ success: true, message: "Sesión cerrada correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Error al cerrar sesión" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
