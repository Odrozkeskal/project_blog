exports.up = function(knex) {
    return knex.schema.createTable('posts', (table) => {
      table.increments('id').primary(); // Автоинкрементируемый ID
      table.string('title').notNullable(); // Заголовок поста
      table.text('content').notNullable(); // Содержимое поста
      table.string('image'); // Добавляем столбец для изображения
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE'); // Внешний ключ на пользователя
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('posts');
  };
  