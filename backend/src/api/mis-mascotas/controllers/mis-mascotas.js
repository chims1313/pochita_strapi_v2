'use strict';

module.exports = {
  async list(ctx) {
    try {
      // Obtener usuario del JWT (automáticamente disponible si auth está activo)
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized('Debes estar autenticado');
      }

      // Buscar mascotas del usuario logueado
      const mascotas = await strapi.documents('api::mascota.mascota').findMany({
        filters: {
          dueno: { id: { $eq: userId } },
        },
        populate: {
          dueno: {
            fields: ['id', 'username', 'email']
          }
        },
      });

      return mascotas;
    } catch (err) {
      console.error('Error en /api/mis-mascotas:', err);
      ctx.status = 500;
      return { error: 'Error al obtener las mascotas' };
    }
  },
};
