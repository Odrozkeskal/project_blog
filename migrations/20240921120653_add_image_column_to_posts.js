exports.up = function(knex) {
    return knex.schema.table('posts', (table) => {
      table.string('image'); // Добавляем столбец для изображений
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('posts', (table) => {
      table.dropColumn('image'); // Удаляем столбец при откате миграции
    });
  };
  