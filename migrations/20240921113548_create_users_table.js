exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
      table.increments('id').primary(); // Автоинкрементируемый ID
      table.string('username').notNullable().unique(); // Уникальное имя пользователя
      table.string('password').notNullable(); // Пароль
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
  };
  