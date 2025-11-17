'use strict';

module.exports = {
  async list(ctx) {
    try {
      const userId = ctx.request.query.userId;

      if (!userId) {
        ctx.status = 400;
        ctx.body = { error: 'Falta userId' };
        return;
      }

      const mascotas = await strapi
        .documents('api::mascota.mascota')
        .findMany({
          filters: {
            dueno: { id: { $eq: Number(userId) } },
          },
        });

      ctx.body = mascotas;
    } catch (err) {
      console.error('Error en /api/mis-mascotas:', err);
      ctx.status = 500;
      ctx.body = { error: 'Error interno' };
    }
  },
};
