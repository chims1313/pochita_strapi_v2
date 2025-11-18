module.exports = (plugin) => {
  // Sobrescribir el endpoint /api/users/me
  plugin.controllers.user.me = async (ctx) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized();
    }

    // Obtener usuario con rol
    const userWithRole = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      user.id,
      {
        populate: ['role'],
      }
    );

    console.log('✅ Usuario con rol (desde /me modificado):', JSON.stringify(userWithRole, null, 2));

    ctx.body = userWithRole;
  };

  return plugin;
};
