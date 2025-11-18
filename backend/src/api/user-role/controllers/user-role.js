'use strict';

module.exports = {
  async me(ctx) {
    try {
      // Obtener el usuario autenticado
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('No user found');
      }

      // Buscar el usuario con el rol usando entityService
      const userWithRole = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: ['role'],
        }
      );

      if (!userWithRole) {
        return ctx.notFound('User not found');
      }

      // Log para debugging
      console.log('✅ Usuario con rol:', JSON.stringify(userWithRole, null, 2));

      // Retornar el usuario con el rol
      return {
        id: userWithRole.id,
        username: userWithRole.username,
        email: userWithRole.email,
        role: userWithRole.role,
      };
    } catch (error) {
      console.error('❌ Error en /user-role/me:', error);
      return ctx.internalServerError('Internal server error');
    }
  },
};
