'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/mis-mascotas',
      handler: 'mis-mascotas.list',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
