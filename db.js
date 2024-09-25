
const knex = require('knex');
const config = require('./knexfile'); 

const environment = process.env.NODE_ENV || 'production'; // выбираем способ разработки (подставляем локальную (development) бд или сетевую(production))
const db = knex(config[environment]); // Инициализация Knex с конфигурацией

module.exports = db; 

