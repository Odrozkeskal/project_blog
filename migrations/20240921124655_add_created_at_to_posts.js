exports.up = function(knex) {
    return knex.schema.table('posts', (table) => {
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('posts', (table) => {
      table.dropColumn('created_at');
    });
  };
  