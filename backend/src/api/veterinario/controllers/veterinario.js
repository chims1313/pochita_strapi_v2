"use strict";

module.exports = {
  async list(ctx) {
    try {
      // Buscar usuarios cuyo rol tenga type = "veterinario"
      const vets = await strapi
        .query("plugin::users-permissions.user")
        .findMany({
          where: { role: { type: "veterinario" } },
          populate: ["role"],
        });

      ctx.body = vets.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role?.name,
      }));
    } catch (err) {
      console.error("Error en /api/veterinarios:", err);
      ctx.status = 500;
      ctx.body = { error: "Error interno" };
    }
  },
};
