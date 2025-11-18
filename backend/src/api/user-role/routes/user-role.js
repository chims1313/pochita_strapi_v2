module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/user-role/me',
      handler: 'user-role.me',
      config: {
        auth: false, // Cambiar a false temporalmente para debuggear
      },
    },
  ],
};
