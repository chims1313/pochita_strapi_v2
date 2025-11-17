"use strict";

const { factories } = require("@strapi/strapi");

module.exports = factories.createCoreController(
	"api::disponible.disponible",
	({ strapi }) => ({
		async create(ctx) {
			// 1. Asegurarse de que hay usuario autenticado
			const user = ctx.state.user;
			if (!user) {
				return ctx.unauthorized("Debe estar autenticado");
			}

			// 2. Datos que vienen del frontend (sin veterinario)
			const bodyData = ctx.request.body?.data ?? {};

			// 3. Inyectar el veterinario usando el usuario actual
			const dataConVeterinario = {
				...bodyData,
				veterinario: user.id, // usamos el id interno del user
			};

			// 4. Crear el registro usando el Document Service
			const entity = await strapi
				.documents("api::disponible.disponible")
				.create({ data: dataConVeterinario });

			// 5. Devolver la respuesta normal
			return entity;
		},
	})
);
