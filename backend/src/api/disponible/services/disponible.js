'use strict';

/**
 * disponible service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::disponible.disponible');
