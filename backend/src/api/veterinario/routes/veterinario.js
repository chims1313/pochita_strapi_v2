"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/veterinarios",
      handler: "veterinario.list",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
