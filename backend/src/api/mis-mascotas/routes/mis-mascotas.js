'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/mis-mascotas',
      handler: 'mis-mascotas.list',
      config: {
        auth: {
          scope: ['api::mis-mascotas.mis-mascotas.list']
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
